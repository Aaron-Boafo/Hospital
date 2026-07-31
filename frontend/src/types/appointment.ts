import { APPOINTMENT_STATUSES } from '../constants/appointments'

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
