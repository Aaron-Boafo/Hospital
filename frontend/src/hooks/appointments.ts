import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  createAppointment,
  deleteAppointment,
  fetchAppointment,
  fetchAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from '../services/appointments'
import type {
  AppointmentFilters,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../services/appointments'

export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: [...queryKeys.appointments.all, filters ?? {}],
    queryFn: () => fetchAppointments(filters),
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id ?? ''),
    queryFn: () => fetchAppointment(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAppointmentInput }) =>
      updateAppointment(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
  })
}
