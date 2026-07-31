import type { AppointmentStatus } from "./appointment.constants.js";

export interface AppointmentRef {
  id: string;
  name: string;
}

export interface AppointmentDto {
  id: string;
  patient: AppointmentRef;
  doctor: AppointmentRef;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  notes?: string | undefined;
}

export type UpdateAppointmentInput = {
  patientId?: string | undefined;
  doctorId?: string | undefined;
  date?: string | undefined;
  time?: string | undefined;
  notes?: string | undefined;
};
