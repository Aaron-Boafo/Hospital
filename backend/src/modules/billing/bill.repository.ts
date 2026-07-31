import { eq } from "drizzle-orm";
import { db } from "@/shared/database/db.js";
import { billItems, bills, payments } from "@/shared/database/schema/schema.js";
import type { BillStatus, PaymentMethod } from "./bill.constants.js";

type BillRow = NonNullable<Awaited<ReturnType<typeof findById>>>;

const withRefs = {
  patient: { columns: { id: true, name: true } as const },
  items: { columns: { id: true, description: true, amount: true } as const },
  payments: {
    columns: { id: true, amount: true, method: true, paidAt: true } as const,
  },
};

async function findMany(filters: {
  patientId?: string;
  status?: BillStatus;
}): Promise<BillRow[]> {
  return db.query.bills.findMany({
    with: withRefs,
    ...(filters.patientId || filters.status
      ? {
          where: {
            ...(filters.patientId ? { patientId: filters.patientId } : {}),
            ...(filters.status ? { status: filters.status } : {}),
          },
        }
      : {}),
    orderBy: { createdAt: "desc" },
  });
}

async function findById(id: string) {
  return db.query.bills.findFirst({ with: withRefs, where: { id } });
}

async function createWithItems(input: {
  patientId: string;
  total: string;
  date: string;
  items: { description: string; amount: string }[];
}): Promise<string> {
  return db.transaction(async (tx) => {
    const billRows = await tx
      .insert(bills)
      .values({
        patientId: input.patientId,
        total: input.total,
        paid: "0",
        status: "UNPAID",
        date: input.date,
      })
      .returning();
    const bill = billRows[0]!;
    await tx
      .insert(billItems)
      .values(
        input.items.map((item) => ({
          billId: bill.id,
          description: item.description,
          amount: item.amount,
        })),
      );
    return bill.id;
  });
}

async function addPayment(input: {
  billId: string;
  amount: string;
  method: PaymentMethod;
  newPaid: string;
  status: BillStatus;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(payments).values({
      billId: input.billId,
      amount: input.amount,
      method: input.method,
    });
    await tx
      .update(bills)
      .set({
        paid: input.newPaid,
        status: input.status,
        paymentMethod: input.method,
      })
      .where(eq(bills.id, input.billId));
  });
}

export const billRepository = { findMany, findById, createWithItems, addPayment };
