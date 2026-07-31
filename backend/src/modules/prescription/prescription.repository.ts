import { eq } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import {
  billItems,
  bills,
  medicines,
  prescriptions,
  prescriptionItems,
} from "@/shared/database/schema/schema.js";
import type { DispenseStatus, PrescriptionStatus } from "./prescription.constants.js";
import { todayString } from "./prescription.utils.js";

type PrescriptionRow = NonNullable<Awaited<ReturnType<typeof findById>>>;

const withRefs = {
  patient: { columns: { id: true, name: true } as const },
  items: {
    with: { medicine: { columns: { id: true, name: true } as const } },
  },
};

async function findMany(filters: { patientId?: string }): Promise<PrescriptionRow[]> {
  return db.query.prescriptions.findMany({
    with: withRefs,
    ...(filters.patientId ? { where: { patientId: filters.patientId } } : {}),
    orderBy: { createdAt: "desc" },
  });
}

async function findById(id: string) {
  return db.query.prescriptions.findFirst({
    with: withRefs,
    where: { id },
  });
}

async function createWithItems(input: {
  patientId: string;
  doctorName?: string | undefined;
  items: {
    medicineId: string;
    dosage: string;
    quantity: number;
    frequency?: string | undefined;
    duration?: string | undefined;
    total: string;
  }[];
}): Promise<string> {
  return db.transaction(async (tx) => {
    const prescriptionRows = await tx
      .insert(prescriptions)
      .values({
        patientId: input.patientId,
        doctorName: input.doctorName,
        status: "PENDING",
        date: todayString(),
      })
      .returning();
    const prescription = prescriptionRows[0]!;
    await tx
      .insert(prescriptionItems)
      .values(
        input.items.map((item) => ({
          prescriptionId: prescription.id,
          medicineId: item.medicineId,
          dosage: item.dosage,
          quantity: item.quantity,
          frequency: item.frequency,
          duration: item.duration,
          total: item.total,
        })),
      );
    return prescription.id;
  });
}

async function applyDispense(input: {
  prescriptionId: string;
  status: PrescriptionStatus;
  itemUpdates: { id: string; dispensed: DispenseStatus }[];
  stockChanges: { medicineId: string; newQuantity: number }[];
  bill?: { patientId: string; total: string } | undefined;
  billItems: { description: string; amount: string }[];
}): Promise<void> {
  await db.transaction(async (tx) => {
    for (const update of input.itemUpdates) {
      await tx
        .update(prescriptionItems)
        .set({ dispensed: update.dispensed })
        .where(eq(prescriptionItems.id, update.id));
    }
    for (const change of input.stockChanges) {
      await tx
        .update(medicines)
        .set({ quantity: change.newQuantity })
        .where(eq(medicines.id, change.medicineId));
    }
    await tx
      .update(prescriptions)
      .set({ status: input.status })
      .where(eq(prescriptions.id, input.prescriptionId));

    if (input.bill) {
      const billRows = await tx
        .insert(bills)
        .values({
          patientId: input.bill.patientId,
          total: input.bill.total,
          paid: "0",
          status: "UNPAID",
          date: todayString(),
        })
        .returning();
      const bill = billRows[0]!;
      await tx
        .insert(billItems)
        .values(
          input.billItems.map((item) => ({
            billId: bill.id,
            description: item.description,
            amount: item.amount,
          })),
        );
    }
  });
}

export const prescriptionRepository = {
  findMany,
  findById,
  createWithItems,
  applyDispense,
};
