import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPrescription,
  dispensePrescription,
  fetchPrescription,
  fetchPrescriptions,
} from '../services/prescriptions'
import { queryKeys } from '../services/queryKeys'
import type { Prescription, PrescriptionInput, QueryParams } from '../services/types'

export function usePrescriptions(params?: QueryParams) {
  return useQuery<Prescription[], Error>({
    queryKey: queryKeys.prescriptions.all(),
    queryFn: () => fetchPrescriptions(params),
  })
}

export function usePrescription(id?: string) {
  return useQuery<Prescription, Error>({
    queryKey: queryKeys.prescriptions.detail(id ?? ''),
    queryFn: () => fetchPrescription(id ?? ''),
    enabled: !!id,
  })
}

export function useCreatePrescription() {
  const qc = useQueryClient()
  return useMutation<Prescription, Error, PrescriptionInput>({
    mutationFn: createPrescription,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.prescriptions.all() }),
  })
}

export function useDispensePrescription() {
  const qc = useQueryClient()
  return useMutation<Prescription, Error, string>({
    mutationFn: dispensePrescription,
    onSuccess: (prescription) => {
      qc.invalidateQueries({ queryKey: queryKeys.prescriptions.all() })
      qc.invalidateQueries({ queryKey: queryKeys.prescriptions.detail(prescription.id) })
      qc.invalidateQueries({ queryKey: queryKeys.medicines.all() })
      qc.invalidateQueries({ queryKey: queryKeys.bills.all() })
    },
  })
}
