import { desc, eq } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import { doctors } from "@/shared/database/schema/schema.js";
import type { Doctor, NewDoctor } from "@/shared/database/schema/types.js";

async function findMany(activeOnly = false): Promise<Doctor[]> {
  return db
    .select()
    .from(doctors)
    .where(activeOnly ? eq(doctors.active, true) : undefined)
    .orderBy(desc(doctors.createdAt));
}

async function findById(id: string): Promise<Doctor | undefined> {
  const rows = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return rows[0];
}

async function create(input: NewDoctor): Promise<Doctor> {
  const rows = await db.insert(doctors).values(input).returning();
  return rows[0]!;
}

async function update(id: string, input: Partial<Doctor>): Promise<Doctor | undefined> {
  const rows = await db
    .update(doctors)
    .set(input)
    .where(eq(doctors.id, id))
    .returning();
  return rows[0];
}

export const doctorRepository = { findMany, findById, create, update };
