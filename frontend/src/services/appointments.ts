import { request } from '../api'
import type {
  AppointmentDto,
  AppointmentFilters,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types'

export async function fetchAppointments(filters?: AppointmentFilters): Promise<AppointmentDto[]> {
  const { appointments } = await request.get<{ appointments: AppointmentDto[] }>('/appointments', {
    params: filters,
  })
  return appointments
}

export async function fetchAppointment(id: string): Promise<AppointmentDto> {
  const { appointment } = await request.get<{ appointment: AppointmentDto }>(`/appointments/${id}`)
  return appointment
}

export async function createAppointment(input: CreateAppointmentInput): Promise<AppointmentDto> {
  const { appointment } = await request.post<{ appointment: AppointmentDto }>('/appointments', input)
  return appointment
}

export async function updateAppointment(id: string, input: UpdateAppointmentInput): Promise<AppointmentDto> {
  const { appointment } = await request.put<{ appointment: AppointmentDto }>(`/appointments/${id}`, input)
  return appointment
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentDto> {
  const { appointment } = await request.patch<{ appointment: AppointmentDto }>(`/appointments/${id}/status`, { status })
  return appointment
}

export async function deleteAppointment(id: string): Promise<void> {
  await request.delete(`/appointments/${id}`)
}
