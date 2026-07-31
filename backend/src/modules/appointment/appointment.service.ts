import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { omitUndefined } from "@/shared/utils/index.js";
import { activityService } from "@/modules/activity/index.js";
import { doctorRepository } from "@/modules/doctor/doctor.repository.js";
import { patientRepository } from "@/modules/patient/patient.repository.js";
import { appointmentRepository } from "./appointment.repository.js";
import type { AppointmentStatus } from "./appointment.constants.js";
import type {
  AppointmentDto,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "./appointment.types.js";

type AppointmentRow = NonNullable<
  Awaited<ReturnType<typeof appointmentRepository.findById>>
>;

function toDto(appointment: AppointmentRow): AppointmentDto {
  return {
    id: appointment.id,
    patient: { id: appointment.patient!.id, name: appointment.patient!.name },
    doctor: { id: appointment.doctor!.id, name: appointment.doctor!.name },
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt,
  };
}

async function listAppointments(filters: {
  date?: string;
  status?: AppointmentStatus;
}): Promise<AppointmentDto[]> {
  const rows = await appointmentRepository.findMany(filters);
  return rows.map(toDto);
}

async function getAppointment(id: string): Promise<AppointmentDto> {
  const row = await appointmentRepository.findById(id);
  if (!row) throw new ServerError("Appointment not found", 404);
  return toDto(row);
}

async function createAppointment(input: CreateAppointmentInput): Promise<AppointmentDto> {
  const patient = await patientRepository.findById(input.patientId);
  if (!patient) throw new ServerError("Patient not found", 404);
  const doctor = await doctorRepository.findById(input.doctorId);
  if (!doctor) throw new ServerError("Doctor not found", 404);
  if (!doctor.active) throw new ServerError("Doctor is not active", 400);

  const created = await appointmentRepository.create({
    ...omitUndefined({ ...input }),
    status: "SCHEDULED",
  });
  logger.info("Appointment created", { appointmentId: created.id });
  return getAppointment(created.id);
}

async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
): Promise<AppointmentDto> {
  const existing = await appointmentRepository.findById(id);
  if (!existing) throw new ServerError("Appointment not found", 404);

  if (input.doctorId) {
    const doctor = await doctorRepository.findById(input.doctorId);
    if (!doctor) throw new ServerError("Doctor not found", 404);
    if (!doctor.active) throw new ServerError("Doctor is not active", 400);
  }

  await appointmentRepository.update(id, omitUndefined({ ...input }));
  return getAppointment(id);
}

async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentDto> {
  const existing = await appointmentRepository.findById(id);
  if (!existing) throw new ServerError("Appointment not found", 404);
  if (existing.status !== "SCHEDULED") {
    throw new ServerError(
      `Only scheduled appointments can change status (current: ${existing.status})`,
      409,
    );
  }
  await appointmentRepository.update(id, { status });
  await activityService.logActivity({
    text: `Appointment ${status === "COMPLETED" ? "completed" : "cancelled"}`,
    type: status === "COMPLETED" ? "SUCCESS" : "WARNING",
  });
  return getAppointment(id);
}

async function deleteAppointment(id: string): Promise<void> {
  const existing = await appointmentRepository.findById(id);
  if (!existing) throw new ServerError("Appointment not found", 404);
  await appointmentRepository.remove(id);
  await activityService.logActivity({
    text: "Appointment deleted",
    type: "WARNING",
  });
}

export const appointmentService = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};
