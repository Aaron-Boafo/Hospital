import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import {
  patients,
  vitalSigns,
  visitRecords,
} from "@/shared/database/schema/schema.js";
import type {
  NewPatient,
  NewVitalSign,
  NewVisitRecord,
  Patient,
  VitalSign,
  VisitRecord,
} from "@/shared/database/schema/types.js";

async function search(search?: string): Promise<Patient[]> {
  if (!search?.trim()) {
    return db.select().from(patients).orderBy(desc(patients.createdAt));
  }
  const term = `%${search.trim()}%`;
  return db
    .select()
    .from(patients)
    .where(
      or(
        ilike(patients.name, term),
        ilike(patients.phone, term),
        ilike(sql`${patients.id}::text`, term),
      ),
    )
    .orderBy(desc(patients.createdAt));
}

async function findById(id: string): Promise<Patient | undefined> {
  const rows = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return rows[0];
}

async function create(input: NewPatient): Promise<Patient> {
  const rows = await db.insert(patients).values(input).returning();
  return rows[0]!;
}

async function update(id: string, input: Partial<Patient>): Promise<Patient | undefined> {
  const rows = await db
    .update(patients)
    .set(input)
    .where(eq(patients.id, id))
    .returning();
  return rows[0];
}

async function remove(id: string): Promise<void> {
  await db.delete(patients).where(eq(patients.id, id));
}

async function listVitals(patientId: string): Promise<VitalSign[]> {
  return db
    .select()
    .from(vitalSigns)
    .where(eq(vitalSigns.patientId, patientId))
    .orderBy(desc(vitalSigns.recordedAt));
}

async function addVital(input: NewVitalSign): Promise<VitalSign> {
  const rows = await db.insert(vitalSigns).values(input).returning();
  return rows[0]!;
}

async function listVisits(patientId: string): Promise<VisitRecord[]> {
  return db
    .select()
    .from(visitRecords)
    .where(eq(visitRecords.patientId, patientId))
    .orderBy(desc(visitRecords.visitDate));
}

async function addVisit(input: NewVisitRecord): Promise<VisitRecord> {
  const rows = await db.insert(visitRecords).values(input).returning();
  return rows[0]!;
}

export const patientRepository = {
  search,
  findById,
  create,
  update,
  remove,
  listVitals,
  addVital,
  listVisits,
  addVisit,
};
