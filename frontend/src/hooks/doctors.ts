import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDoctor,
  deleteDoctor,
  fetchDoctor,
  fetchDoctors,
  updateDoctor,
} from '../services/doctors'
import { queryKeys } from '../services/queryKeys'
import type { Doctor, DoctorInput, QueryParams } from '../services/types'

export function useDoctors(params?: QueryParams) {
  return useQuery<Doctor[], Error>({
    queryKey: queryKeys.doctors.all(),
    queryFn: () => fetchDoctors(params),
  })
}

export function useDoctor(id?: string) {
  return useQuery<Doctor, Error>({
    queryKey: queryKeys.doctors.detail(id ?? ''),
    queryFn: () => fetchDoctor(id ?? ''),
    enabled: !!id,
  })
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation<Doctor, Error, DoctorInput>({
    mutationFn: createDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.doctors.all() }),
  })
}

export function useUpdateDoctor() {
  const qc = useQueryClient()
  return useMutation<Doctor, Error, { id: string } & DoctorInput>({
    mutationFn: updateDoctor,
    onSuccess: (doctor) => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all() })
      qc.invalidateQueries({ queryKey: queryKeys.doctors.detail(doctor.id) })
    },
  })
}

export function useDeleteDoctor() {
  const qc = useQueryClient()
  return useMutation<string, Error, string>({
    mutationFn: deleteDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.doctors.all() }),
  })
}
