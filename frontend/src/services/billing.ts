import { request } from '../api'
import type { BillDto, BillFilters, CreateBillInput, RecordPaymentInput } from '../types'

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
