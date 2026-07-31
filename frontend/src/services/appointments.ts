import { request } from '../api'

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export interface AppointmentRef {
  id: string
  name: string
}

export interface AppointmentDto {
  id: string
  patient: AppointmentRef
  doctor: AppointmentRef
  date: string
  time: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
}

export interface CreateAppointmentInput {
  patientId: string
  doctorId: string
  date: string
  time: string
  notes?: string | undefined
}

export type UpdateAppointmentInput = {
  patientId?: string | undefined
  doctorId?: string | undefined
  date?: string | undefined
  time?: string | undefined
  notes?: string | undefined
}

export interface AppointmentFilters {
  date?: string | undefined
  status?: AppointmentStatus | undefined
}

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
