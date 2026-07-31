import { request } from '../api'
import type { Appointment, AppointmentInput, AppointmentStatus, QueryParams } from './types'

export async function fetchAppointments(params?: QueryParams): Promise<Appointment[]> {
  const { appointments } = await request.get<{ appointments: Appointment[] }>('/appointments', {
    params,
  })
  return appointments
}

export async function fetchAppointment(id: string): Promise<Appointment> {
  const { appointment } = await request.get<{ appointment: Appointment }>(`/appointments/${id}`)
  return appointment
}

export async function createAppointment(payload: AppointmentInput): Promise<Appointment> {
  const { appointment } = await request.post<{ appointment: Appointment }>('/appointments', payload)
  return appointment
}

export async function updateAppointment({
  id,
  ...payload
}: { id: string } & AppointmentInput): Promise<Appointment> {
  const { appointment } = await request.put<{ appointment: Appointment }>(
    `/appointments/${id}`,
    payload,
  )
  return appointment
}

export async function updateAppointmentStatus({
  id,
  status,
}: {
  id: string
  status: AppointmentStatus
}): Promise<Appointment> {
  const { appointment } = await request.patch<{ appointment: Appointment }>(
    `/appointments/${id}/status`,
    { status },
  )
  return appointment
}

export async function deleteAppointment(id: string): Promise<string> {
  await request.delete(`/appointments/${id}`)
  return id
}
