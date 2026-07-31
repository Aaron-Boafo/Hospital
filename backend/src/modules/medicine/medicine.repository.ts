import { asc, eq } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import { medicines } from "@/shared/database/schema/schema.js";
import type { Medicine, NewMedicine } from "@/shared/database/schema/types.js";

async function findMany(): Promise<Medicine[]> {
  return db.select().from(medicines).orderBy(asc(medicines.name));
}

async function findById(id: string): Promise<Medicine | undefined> {
  const rows = await db.select().from(medicines).where(eq(medicines.id, id)).limit(1);
  return rows[0];
}

async function create(input: NewMedicine): Promise<Medicine> {
  const rows = await db.insert(medicines).values(input).returning();
  return rows[0]!;
}

async function update(id: string, input: Partial<Medicine>): Promise<Medicine | undefined> {
  const rows = await db
    .update(medicines)
    .set(input)
    .where(eq(medicines.id, id))
    .returning();
  return rows[0];
}

async function remove(id: string): Promise<void> {
  await db.delete(medicines).where(eq(medicines.id, id));
}

export const medicineRepository = { findMany, findById, create, update, remove };
