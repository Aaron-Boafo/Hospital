import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import {
  bedAssignments,
  beds,
  wards,
} from "@/shared/database/schema/schema.js";
import type { NewBed, Ward } from "@/shared/database/schema/types.js";
import type { BedType } from "./bed.constants.js";

const bedWithOccupancy = {
  ward: { columns: { id: true, name: true, totalBeds: true } as const },
  assignments: {
    columns: { id: true, patientId: true, admittedAt: true } as const,
    where: { dischargedAt: { isNull: true } as const },
    with: { patient: { columns: { id: true, name: true } as const } },
  },
};

const assignmentWithRefs = {
  bed: {
    columns: { id: true, number: true } as const,
    with: { ward: { columns: { id: true, name: true } as const } },
  },
  patient: { columns: { id: true, name: true } as const },
  assignedByUser: { columns: { id: true, name: true } as const },
};

async function findWards() {
  return db.query.wards.findMany({
    with: { beds: { columns: { id: true } as const } },
    orderBy: { name: "asc" },
  });
}

async function findWardById(id: string): Promise<Ward | undefined> {
  return db.query.wards.findFirst({ where: { id } });
}

async function findWardByName(name: string): Promise<Ward | undefined> {
  return db.query.wards.findFirst({ where: { name } });
}

async function findWardOccupiedCount(wardId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bedAssignments)
    .innerJoin(beds, eq(bedAssignments.bedId, beds.id))
    .where(and(eq(beds.wardId, wardId), isNull(bedAssignments.dischargedAt)));
  return rows[0]?.count ?? 0;
}

async function createWard(input: {
  name: string;
  totalBeds: number;
}): Promise<Ward> {
  return db.transaction(async (tx) => {
    const wardRows = await tx.insert(wards).values(input).returning();
    const ward = wardRows[0]!;
    if (input.totalBeds > 0) {
      await tx.insert(beds).values(
        Array.from({ length: input.totalBeds }, (_, i) => ({
          wardId: ward.id,
          number: i + 1,
        })),
      );
    }
    return ward;
  });
}

async function updateWardName(
  id: string,
  name: string,
): Promise<void> {
  await db.update(wards).set({ name }).where(eq(wards.id, id));
}

async function updateWardTotal(id: string, totalBeds: number): Promise<void> {
  await db.update(wards).set({ totalBeds }).where(eq(wards.id, id));
}

async function addBedsToWard(wardId: string, numbers: number[]): Promise<void> {
  await db.insert(beds).values(
    numbers.map((number) => ({
      wardId,
      number,
    })),
  );
}

async function removeBedsFromWard(wardId: string, numbers: number[]): Promise<void> {
  await db.delete(beds).where(
    and(eq(beds.wardId, wardId), inArray(beds.number, numbers)),
  );
}

async function removeWard(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(wards).where(eq(wards.id, id));
  });
}

async function findWardBedNumbers(wardId: string): Promise<number[]> {
  const rows = await db.query.beds.findMany({
    where: { wardId },
    columns: { number: true },
  });
  return rows.map((row) => row.number);
}

async function findBeds() {
  return db.query.beds.findMany({
    with: bedWithOccupancy,
    orderBy: { number: "asc" },
  });
}

async function findBedById(id: string) {
  return db.query.beds.findFirst({
    with: bedWithOccupancy,
    where: { id },
  });
}

async function findBedByWardAndNumber(wardId: string, number: number) {
  return db.query.beds.findFirst({
    with: bedWithOccupancy,
    where: { wardId, number },
  });
}

async function createBed(input: {
  wardId: string;
  number: number;
  bedType?: BedType | undefined;
}): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const bedRows = await tx
      .insert(beds)
      .values(input as NewBed)
      .returning({ id: beds.id });
    await tx
      .update(wards)
      .set({ totalBeds: sql`${wards.totalBeds} + 1` })
      .where(eq(wards.id, input.wardId));
    return bedRows[0]!;
  });
}

async function updateBed(
  id: string,
  input: Partial<Pick<NewBed, "number" | "bedType" | "status">>,
): Promise<void> {
  await db.update(beds).set(input).where(eq(beds.id, id));
}

async function removeBed(id: string, wardId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(beds).where(eq(beds.id, id));
    await tx
      .update(wards)
      .set({ totalBeds: sql`greatest(${wards.totalBeds} - 1, 0)` })
      .where(eq(wards.id, wardId));
  });
}

async function findActiveAssignmentByBed(bedId: string) {
  return db.query.bedAssignments.findFirst({
    where: { bedId, dischargedAt: { isNull: true } },
    columns: { id: true, patientId: true },
  });
}

async function findActiveAssignmentByPatient(patientId: string) {
  return db.query.bedAssignments.findFirst({
    where: { patientId, dischargedAt: { isNull: true } },
    columns: { id: true, bedId: true },
  });
}

async function findAssignmentById(id: string) {
  return db.query.bedAssignments.findFirst({
    with: assignmentWithRefs,
    where: { id },
  });
}

async function findAssignments() {
  return db.query.bedAssignments.findMany({
    with: assignmentWithRefs,
    orderBy: { dischargedAt: "desc", admittedAt: "desc" },
  });
}

async function admit(input: {
  bedId: string;
  patientId: string;
  assignedBy: string;
}): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .insert(bedAssignments)
      .values(input)
      .returning({ id: bedAssignments.id });
    await tx.update(beds).set({ status: "OCCUPIED" }).where(eq(beds.id, input.bedId));
    return rows[0]!;
  });
}

async function discharge(assignmentId: string, bedId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(bedAssignments)
      .set({ dischargedAt: new Date() })
      .where(eq(bedAssignments.id, assignmentId));
    await tx.update(beds).set({ status: "AVAILABLE" }).where(eq(beds.id, bedId));
  });
}

export const bedRepository = {
  findWards,
  findWardById,
  findWardByName,
  findWardOccupiedCount,
  createWard,
  updateWardName,
  updateWardTotal,
  addBedsToWard,
  removeBedsFromWard,
  removeWard,
  findWardBedNumbers,
  findBeds,
  findBedById,
  findBedByWardAndNumber,
  createBed,
  updateBed,
  removeBed,
  findActiveAssignmentByBed,
  findActiveAssignmentByPatient,
  findAssignmentById,
  findAssignments,
  admit,
  discharge,
};
