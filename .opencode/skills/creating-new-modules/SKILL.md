---
name: creating-new-modules
description: Use when building, extending, or fixing backend modules in the Hospital monorepo (backend/ Express + Drizzle + TypeScript). Triggers on "new module", "add API endpoint", "create the backend for X", "routes", "schema", "repository", "service" in the backend context. Encodes the strict per-module layering (constants -> types -> validation -> repository -> service -> controller -> routes -> index barrel), Drizzle RQB v2 query rules, zod v4 validation, exactOptionalPropertyTypes discipline, shared-infra usage, and role-guard wiring. Do NOT use for frontend code or for projects outside this monorepo.
---

# Creating New Modules

Every feature in `backend/src/modules/` follows the same eight-file skeleton
(`<name>` singular, e.g. `appointment`, `bill`, `prescription`). One feature
= one folder = one index barrel.

## Trigger keywords

"new module", "backend module", "endpoints", "API", "routes", "schema",
"domain", "CRUD". If the request says "frontend" or touches `frontend/`, this
skill does not apply.

## File skeleton

```
src/modules/<name>/
  <name>.constants.ts   enum-like constant arrays + derived types
  <name>.types.ts       DTOs + input types (explicit | undefined)
  <name>.validation.ts  zod schemas for create/update
  <name>.repository.ts  raw DB access (drizzle), never business logic
  <name>.service.ts     business rules, DTO mapping, logging, activities
  <name>.controller.ts  thin HTTP handlers (parse, call service, res.json)
  <name>.routes.ts      express Router + role guards
  index.ts              barrel: export * from "./<name>.routes.js"; (also service + types)
```

Constants and validation files are internal-only: the barrel must NOT export
them. Barrel imports use the `.js` extension (ESM nodenext): `export * from
"./<name>.routes.js";`.

## Shared infrastructure (never reimplement)

| Concern        | Import from                                  |
| -------------- | -------------------------------------------- |
| HTTP errors    | `@/shared/errors/index.js` -> `ServerError(message, status)` |
| Logging        | `@/shared/logger/index.js` -> `logger.info/warn/error(obj)` |
| Async wrapper  | `@/shared/utils/index.js` -> `asyncHandler`  |
| Auth guards    | `@/shared/middleware/auth.js` -> `authenticate`, `requireRole("ADMIN")` |
| DB             | `@/shared/database/db.js` -> `db`, schema from `@/shared/database/schema/schema.js` |
| Activity feed  | `@/modules/activity/index.js` -> `activityService.logActivity({ text, type })` |

Do NOT scatter try/catch across controllers; `asyncHandler` + the central
error handler (ZodError -> 400, ServerError -> its status, else 500) handle
failures. Only catch where a translation is required (e.g. FK violation 23503
-> 409).

## Layering rules

1. **Constants** — `export const X_STATUSES = ["A", "B"] as const; export type XStatus = (typeof X_STATUSES)[number];` Keep display labels as a Record<XStatus, string>.
2. **Types** — DTOs mirror the API contract; nullable DB columns are `string | null`, never `string | undefined`. Input types: optional fields MUST be `field?: T | undefined` (exactOptionalPropertyTypes). Update types are explicit objects with every field optional — NEVER `Partial<CreateInput>` (causes TS2379).
3. **Validation** — zod v4 (`z.uuid()`, `z.enum(ENUM_VALUES)`, `z.coerce.number().int().min(1)`). Create: required fields + `.default(x)` for optional-with-default. Update: all optional. Export `createXSchema` / `updateXSchema`.
4. **Repository** — drizzle only. See RQB rules below. Multi-table writes go in `db.transaction(async (tx) => ...)`; grab inserted rows as `rows[0]!` (noUncheckedIndexedAccess). Return rows, never DTOs.
5. **Service** — the only layer that maps rows to DTOs (`toDto`), applies business rules, throws ServerError (404 for missing rows, 409 for invalid state transitions, 400 for bad money), and logs activities. Verify referenced entities exist (e.g. patient) before creating.
6. **Controller** — parse `req.params`/`req.query` with `z.uuid()` (query only when a plain string), `schema.parse(req.body)`, delegate, `res.json({ <name>: result })` (201 on create). No logic.
7. **Routes** — `Router()`, `router.use(requireRole(...))` for whole-module guards, REST paths `/api/<plural>` (paths themselves are mounted under `/api`). `GET /<plural>`, `GET /<plural>/:id`, `POST /<plural>`, `PATCH /<plural>/:id`, `DELETE /<plural>/:id`, plus sub-resources/actions (`POST /<plural>/:id/payments`, `POST /<plural>/:id/dispense`).
8. **Barrel** — routes, service, types only (see above).
9. **Wire-up** — add `import { <name>Router } from "@/modules/<name>/index.js";` and mount inside the existing `app.use("/api", authenticate, ..., <name>Router)` chain in `src/app.ts`. The `authenticate` middleware is global for `/api`; per-module `requireRole` refines it.

## Drizzle RQB v2 rules (drizzle-orm 1.0.0-rc.4)

- Queries use the relational API: `db.query.<table>.findMany({ with, where, orderBy })`.
- `with` uses `{ ref: { columns: { id: true, name: true } } }` object form — no select() callbacks. Order: `orderBy: { col: "asc" | "desc" }`.
- `where` is a PLAIN OBJECT, not a function: `{ patientId }`, `{ status: { in: [...] } }`, `{ date: { gte: x } }`, `{ and: [...] }` / `{ or: [...] }`. Multiple keys AND together. Never pass `SQL<unknown>` to RQB where.
- Optional related refs come back null — DTO mapping must handle `row.patient!.id` after filtering `!row.patient`; type rows as `NonNullable<Awaited<ReturnType<typeof repo.findById>>>`.
- drizzle-orm rc.4 has NO `cast` export. To ilike a uuid column: `ilike(sql`${patients.id}::text`, term)`.
- Money columns: `numeric(12,2)` columns come back as STRINGS. Insert with `String(number)` / `.toFixed(2)`; map back to numbers in `toDto` (local `money = (v: string) => Number(v)`).

## Money and stock discipline

- Compute totals in service with number math; round with `.toFixed(2)` before insert.
- Bill statuses: UNPAID -> PARTIAL -> PAID recomputed from payments sum; overpay -> ServerError 400 "Payment amount exceeds balance due (GH₵X.XX)".
- Prescription dispense: only PENDING may dispense (else 409); per item `dispensed = min(quantity, stock)`; decrement stock; auto-create UNPAID bill for dispensed quantities; status DISPENSED/PARTIAL. All within ONE transaction.
- Medicine low-stock flags are computed in `toDto` (never stored): `isLowStock = reorderLevel > 0 && quantity <= reorderLevel`, `isExpired`/`isExpiringSoon` vs today(+30d). Dates: `date`-typed columns compare as strings `YYYY-MM-DD` (see `prescription.utils.js` `todayString()`).

## Role matrix (current)

- patient, appointment: ADMIN / DOCTOR / RECEPTIONIST
- doctor, medicine: ADMIN
- billing: ADMIN / ACCOUNTANT
- prescription: ADMIN / DOCTOR
- activity: any authenticated user

## Verification loop

1. `npx tsc --noEmit` must be clean (expect exactOptionalPropertyTypes / RQB shape errors on first pass — fix, don't fight).
2. Start server: kill stale PID on port 1000 (`taskkill //PID <pid> //F`), `npx tsx src/app.ts > /tmp/hms-server.log 2>&1 &`, curl-poll `/health`.
3. Smoke-test every endpoint with the admin token in `$TMP/hms-test-token.txt`: happy path, 400s (validation, overpay), 404s, 409s (state transitions), and role denial (receptionist token `$TMP/hms-test-rec-token.txt`).
4. Verify side effects (stock, bills, activities) after mutations.

## Scaffolding a new module

Never write files top-to-bottom in one pass: constants+types+validation first,
then repository (tsc), then service, then controller/routes/index, wiring last.
Run `npx tsc --noEmit` after each pair to catch shape errors early.
