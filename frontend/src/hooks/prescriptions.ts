import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  createPrescription,
  dispensePrescription,
  fetchPrescription,
  fetchPrescriptions,
} from '../services/prescriptions'
import type { CreatePrescriptionInput } from '../services/prescriptions'

export function usePrescriptions(patientId?: string) {
  return useQuery({
    queryKey: [...queryKeys.prescriptions.all, patientId ?? ''],
    queryFn: () => fetchPrescriptions(patientId),
  })
}

export function usePrescription(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.prescriptions.detail(id ?? ''),
    queryFn: () => fetchPrescription(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePrescriptionInput) => createPrescription(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.all })
    },
  })
}

export function useDispensePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dispensePrescription(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.detail(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.bills.all })
    },
  })
}
