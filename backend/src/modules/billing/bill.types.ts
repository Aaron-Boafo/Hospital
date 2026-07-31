import type { BillStatus, PaymentMethod } from "./bill.constants.js";

export interface BillItemDto {
  id: string;
  description: string;
  amount: number;
}

export interface PaymentDto {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
}

export interface BillDto {
  id: string;
  patient: { id: string; name: string };
  items: BillItemDto[];
  payments: PaymentDto[];
  total: number;
  paid: number;
  balanceDue: number;
  status: BillStatus;
  paymentMethod: PaymentMethod | null;
  date: string;
  createdAt: Date;
}

export interface BillItemInput {
  description: string;
  amount: number;
}

export interface CreateBillInput {
  patientId: string;
  items: BillItemInput[];
}

export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
}
