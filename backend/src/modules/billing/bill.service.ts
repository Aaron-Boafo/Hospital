import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { activityService } from "@/modules/activity/index.js";
import { patientRepository } from "@/modules/patient/patient.repository.js";
import { billRepository } from "./bill.repository.js";
import type { BillStatus, PaymentMethod } from "./bill.constants.js";
import type { BillDto, CreateBillInput, RecordPaymentInput } from "./bill.types.js";

type BillRow = NonNullable<Awaited<ReturnType<typeof billRepository.findById>>>;

const money = (value: string): number => Number(value);

function toDto(row: BillRow): BillDto {
  const total = money(row.total);
  const paid = money(row.paid);
  return {
    id: row.id,
    patient: { id: row.patient!.id, name: row.patient!.name },
    items: row.items.map((item) => ({
      id: item.id,
      description: item.description,
      amount: money(item.amount),
    })),
    payments: row.payments.map((payment) => ({
      id: payment.id,
      amount: money(payment.amount),
      method: payment.method,
      paidAt: payment.paidAt,
    })),
    total,
    paid,
    balanceDue: Math.round((total - paid) * 100) / 100,
    status: row.status,
    paymentMethod: row.paymentMethod,
    date: row.date,
    createdAt: row.createdAt,
  };
}

async function getBill(id: string): Promise<BillDto> {
  const row = await billRepository.findById(id);
  if (!row) throw new ServerError("Bill not found", 404);
  return toDto(row);
}

async function listBills(filters: {
  patientId?: string;
  status?: BillStatus;
}): Promise<BillDto[]> {
  const rows = await billRepository.findMany(filters);
  return rows.map(toDto);
}

async function createBill(input: CreateBillInput): Promise<BillDto> {
  const patient = await patientRepository.findById(input.patientId);
  if (!patient) throw new ServerError("Patient not found", 404);

  const total = input.items.reduce((sum, item) => sum + item.amount, 0);
  const billId = await billRepository.createWithItems({
    patientId: input.patientId,
    total: total.toFixed(2),
    date: new Date().toISOString().slice(0, 10),
    items: input.items.map((item) => ({
      description: item.description,
      amount: item.amount.toFixed(2),
    })),
  });

  logger.info("Bill created", { billId, total });
  await activityService.logActivity({
    text: `Bill created — GH₵${total.toFixed(2)}`,
    type: "INFO",
  });
  return getBill(billId);
}

async function recordPayment(
  billId: string,
  input: RecordPaymentInput,
): Promise<BillDto> {
  const row = await billRepository.findById(billId);
  if (!row) throw new ServerError("Bill not found", 404);

  const total = money(row.total);
  const paid = money(row.paid);
  const balanceDue = Math.round((total - paid) * 100) / 100;

  if (input.amount > balanceDue) {
    throw new ServerError(
      `Payment amount exceeds balance due (GH₵${balanceDue.toFixed(2)})`,
      400,
    );
  }

  const newPaid = Math.round((paid + input.amount) * 100) / 100;
  const status: BillStatus = newPaid >= total ? "PAID" : "PARTIAL";

  await billRepository.addPayment({
    billId,
    amount: input.amount.toFixed(2),
    method: input.method,
    newPaid: newPaid.toFixed(2),
    status,
  });

  logger.info("Payment recorded", { billId, amount: input.amount, status });
  await activityService.logActivity({
    text: `Payment of GH₵${input.amount.toFixed(2)} recorded (${input.method})`,
    type: "SUCCESS",
  });
  return getBill(billId);
}

export const billService = { listBills, getBill, createBill, recordPayment };
