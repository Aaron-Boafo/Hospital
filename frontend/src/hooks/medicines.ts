import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMedicine,
  deleteMedicine,
  fetchMedicine,
  fetchMedicines,
  updateMedicine,
} from '../services/medicines'
import { queryKeys } from '../services/queryKeys'
import type { Medicine, MedicineInput, QueryParams } from '../services/types'

export function useMedicines(params?: QueryParams) {
  return useQuery<Medicine[], Error>({
    queryKey: queryKeys.medicines.all(),
    queryFn: () => fetchMedicines(params),
  })
}

export function useMedicine(id?: string) {
  return useQuery<Medicine, Error>({
    queryKey: queryKeys.medicines.detail(id ?? ''),
    queryFn: () => fetchMedicine(id ?? ''),
    enabled: !!id,
  })
}

export function useCreateMedicine() {
  const qc = useQueryClient()
  return useMutation<Medicine, Error, MedicineInput>({
    mutationFn: createMedicine,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.medicines.all() }),
  })
}

export function useUpdateMedicine() {
  const qc = useQueryClient()
  return useMutation<Medicine, Error, { id: string } & MedicineInput>({
    mutationFn: updateMedicine,
    onSuccess: (medicine) => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines.all() })
      qc.invalidateQueries({ queryKey: queryKeys.medicines.detail(medicine.id) })
    },
  })
}

export function useDeleteMedicine() {
  const qc = useQueryClient()
  return useMutation<string, Error, string>({
    mutationFn: deleteMedicine,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.medicines.all() }),
  })
}
