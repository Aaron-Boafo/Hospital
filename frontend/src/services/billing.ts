import { request } from '../api'
import type { Bill, BillInput, PaymentInput, QueryParams } from './types'

export async function fetchBills(params?: QueryParams): Promise<Bill[]> {
  const { bills } = await request.get<{ bills: Bill[] }>('/bills', { params })
  return bills
}

export async function fetchBill(id: string): Promise<Bill> {
  const { bill } = await request.get<{ bill: Bill }>(`/bills/${id}`)
  return bill
}

export async function createBill(payload: BillInput): Promise<Bill> {
  const { bill } = await request.post<{ bill: Bill }>('/bills', payload)
  return bill
}

export async function recordPayment({
  id,
  ...payload
}: { id: string } & PaymentInput): Promise<Bill> {
  const { bill } = await request.post<{ bill: Bill }>(`/bills/${id}/payments`, payload)
  return bill
}
