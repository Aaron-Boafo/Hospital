import { request } from '../api'

export const BILL_STATUSES = ['UNPAID', 'PARTIAL', 'PAID'] as const
export type BillStatus = (typeof BILL_STATUSES)[number]

export const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE MONEY', 'BANK TRANSFER'] as const
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

export async function fetchBills(filters?: BillFilters): Promise<BillDto[]> {
  const { bills } = await request.get<{ bills: BillDto[] }>('/bills', { params: filters })
  return bills
}

export async function fetchBill(id: string): Promise<BillDto> {
  const { bill } = await request.get<{ bill: BillDto }>(`/bills/${id}`)
  return bill
}

export async function createBill(input: CreateBillInput): Promise<BillDto> {
  const { bill } = await request.post<{ bill: BillDto }>('/bills', input)
  return bill
}

export async function recordPayment(billId: string, input: RecordPaymentInput): Promise<BillDto> {
  const { bill } = await request.post<{ bill: BillDto }>(`/bills/${billId}/payments`, input)
  return bill
}
