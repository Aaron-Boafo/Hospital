import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import { createBill, fetchBill, fetchBills, recordPayment } from '../services/billing'
import type { BillFilters, CreateBillInput, RecordPaymentInput } from '../services/billing'

export function useBills(filters?: BillFilters) {
  return useQuery({
    queryKey: [...queryKeys.bills.all, filters ?? {}],
    queryFn: () => fetchBills(filters),
  })
}

export function useBill(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bills.detail(id ?? ''),
    queryFn: () => fetchBill(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBillInput) => createBill(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bills.all })
    },
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ billId, input }: { billId: string; input: RecordPaymentInput }) =>
      recordPayment(billId, input),
    onSuccess: (_data, { billId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bills.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.bills.detail(billId) })
    },
  })
}
