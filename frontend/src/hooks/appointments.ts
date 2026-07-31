import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAppointment,
  deleteAppointment,
  fetchAppointment,
  fetchAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from '../services/appointments'
import { queryKeys } from '../services/queryKeys'
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  QueryParams,
} from '../services/types'

export function useAppointments(params?: QueryParams) {
  return useQuery<Appointment[], Error>({
    queryKey: queryKeys.appointments.all(),
    queryFn: () => fetchAppointments(params),
  })
}

export function useAppointment(id?: string) {
  return useQuery<Appointment, Error>({
    queryKey: queryKeys.appointments.detail(id ?? ''),
    queryFn: () => fetchAppointment(id ?? ''),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation<Appointment, Error, AppointmentInput>({
    mutationFn: createAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments.all() }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation<Appointment, Error, { id: string } & AppointmentInput>({
    mutationFn: updateAppointment,
    onSuccess: (appointment) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all() })
      qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(appointment.id) })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation<Appointment, Error, { id: string; status: AppointmentStatus }>({
    mutationFn: updateAppointmentStatus,
    onSuccess: (appointment) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all() })
      qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(appointment.id) })
    },
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation<string, Error, string>({
    mutationFn: deleteAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments.all() }),
  })
}
