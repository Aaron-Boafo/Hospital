import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  createDoctor,
  fetchDoctor,
  fetchDoctors,
  toggleDoctorActive,
  updateDoctor,
} from '../services/doctors'
import type { CreateDoctorInput, UpdateDoctorInput } from '../types'

export function useDoctors(activeOnly?: boolean) {
  return useQuery({
    queryKey: [...queryKeys.doctors.all, activeOnly ? 'active' : 'all'],
    queryFn: () => fetchDoctors(activeOnly),
  })
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id ?? ''),
    queryFn: () => fetchDoctor(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDoctorInput) => createDoctor(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all })
    },
  })
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDoctorInput }) => updateDoctor(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctors.detail(id) })
    },
  })
}

export function useToggleDoctorActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleDoctorActive(id, active),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.doctors.detail(id) })
    },
  })
}
