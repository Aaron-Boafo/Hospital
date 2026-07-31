import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBill, fetchBill, fetchBills, recordPayment } from '../services/billing'
import { queryKeys } from '../services/queryKeys'
import type { Bill, BillInput, PaymentInput, QueryParams } from '../services/types'

export function useBills(params?: QueryParams) {
  return useQuery<Bill[], Error>({
    queryKey: queryKeys.bills.all(),
    queryFn: () => fetchBills(params),
  })
}

export function useBill(id?: string) {
  return useQuery<Bill, Error>({
    queryKey: queryKeys.bills.detail(id ?? ''),
    queryFn: () => fetchBill(id ?? ''),
    enabled: !!id,
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  return useMutation<Bill, Error, BillInput>({
    mutationFn: createBill,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.bills.all() }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation<Bill, Error, { id: string } & PaymentInput>({
    mutationFn: recordPayment,
    onSuccess: (bill) => {
      qc.invalidateQueries({ queryKey: queryKeys.bills.all() })
      qc.invalidateQueries({ queryKey: queryKeys.bills.detail(bill.id) })
    },
  })
}
