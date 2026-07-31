import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { omitUndefined } from "@/shared/utils/index.js";
import type { Doctor } from "@/shared/database/schema/types.js";
import { activityService } from "@/modules/activity/index.js";
import { doctorRepository } from "./doctor.repository.js";
import type { CreateDoctorInput, DoctorDto, UpdateDoctorInput } from "./doctor.types.js";

function toDto(doctor: Doctor): DoctorDto {
  return {
    id: doctor.id,
    name: doctor.name,
    department: doctor.department,
    phone: doctor.phone,
    email: doctor.email,
    active: doctor.active,
    createdAt: doctor.createdAt,
  };
}

async function listDoctors(activeOnly = false): Promise<DoctorDto[]> {
  const doctors = await doctorRepository.findMany(activeOnly);
  return doctors.map(toDto);
}

async function getDoctor(id: string): Promise<DoctorDto> {
  const doctor = await doctorRepository.findById(id);
  if (!doctor) throw new ServerError("Doctor not found", 404);
  return toDto(doctor);
}

async function createDoctor(input: CreateDoctorInput): Promise<DoctorDto> {
  const doctor = await doctorRepository.create(
    omitUndefined({ ...input, active: true }),
  );
  logger.info("Doctor created", { doctorId: doctor.id });
  await activityService.logActivity({
    text: `Doctor ${doctor.name} added`,
    type: "SUCCESS",
  });
  return toDto(doctor);
}

async function updateDoctor(id: string, input: UpdateDoctorInput): Promise<DoctorDto> {
  const existing = await doctorRepository.findById(id);
  if (!existing) throw new ServerError("Doctor not found", 404);
  const updated = await doctorRepository.update(id, omitUndefined({ ...input }));
  return toDto(updated!);
}

async function toggleDoctorActive(id: string): Promise<DoctorDto> {
  const existing = await doctorRepository.findById(id);
  if (!existing) throw new ServerError("Doctor not found", 404);
  const updated = await doctorRepository.update(id, {
    active: !existing.active,
  });
  const doctor = toDto(updated!);
  await activityService.logActivity({
    text: `Doctor ${doctor.name} ${doctor.active ? "activated" : "deactivated"}`,
    type: doctor.active ? "SUCCESS" : "WARNING",
  });
  return doctor;
}

export const doctorService = {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  toggleDoctorActive,
};
