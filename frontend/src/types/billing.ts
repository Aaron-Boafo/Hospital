import { BILL_STATUSES, PAYMENT_METHODS } from '../constants/billing'

export type BillStatus = (typeof BILL_STATUSES)[number]

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface BillItemDto {
  id: string
  description: string
  amount: number
}

export interface PaymentDto {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export interface BillDto {
  id: string
  patient: { id: string; name: string }
  items: BillItemDto[]
  payments: PaymentDto[]
  total: number
  paid: number
  balanceDue: number
  status: BillStatus
  paymentMethod: PaymentMethod | null
  date: string
  createdAt: string
}

export interface BillItemInput {
  description: string
  amount: number
}

export interface CreateBillInput {
  patientId: string
  items: BillItemInput[]
}

export interface RecordPaymentInput {
  amount: number
  method: PaymentMethod
}

export interface BillFilters {
  patientId?: string | undefined
  status?: BillStatus | undefined
}
