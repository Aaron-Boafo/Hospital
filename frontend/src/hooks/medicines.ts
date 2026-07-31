import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  createMedicine,
  deleteMedicine,
  fetchMedicine,
  fetchMedicines,
  updateMedicine,
} from '../services/medicines'
import type { CreateMedicineInput, UpdateMedicineInput } from '../types'

export function useMedicines() {
  return useQuery({
    queryKey: queryKeys.medicines.all,
    queryFn: fetchMedicines,
  })
}

export function useMedicine(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.medicines.detail(id ?? ''),
    queryFn: () => fetchMedicine(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMedicineInput) => createMedicine(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all })
    },
  })
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMedicineInput }) => updateMedicine(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.medicines.detail(id) })
    },
  })
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMedicine(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.medicines.all })
    },
  })
}
