import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { omitUndefined } from "@/shared/utils/index.js";
import type {
  NewPatient,
  NewVitalSign,
  NewVisitRecord,
  Patient,
  VitalSign,
  VisitRecord,
} from "@/shared/database/schema/types.js";
import { activityService } from "@/modules/activity/index.js";
import { patientRepository } from "./patient.repository.js";
import type {
  CreatePatientInput,
  CreateVitalSignInput,
  CreateVisitRecordInput,
  PatientDetailDto,
  PatientDto,
  UpdatePatientInput,
} from "./patient.types.js";

function toDto(patient: Patient): PatientDto {
  return {
    id: patient.id,
    name: patient.name,
    dob: patient.dob,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    emergencyContact: patient.emergencyContact,
    createdAt: patient.createdAt,
  };
}

async function listPatients(search?: string): Promise<PatientDto[]> {
  const patients = await patientRepository.search(search);
  return patients.map(toDto);
}

async function getPatientDetail(id: string): Promise<PatientDetailDto> {
  const patient = await patientRepository.findById(id);
  if (!patient) throw new ServerError("Patient not found", 404);
  const [vitals, visits] = await Promise.all([
    patientRepository.listVitals(id),
    patientRepository.listVisits(id),
  ]);
  return { patient: toDto(patient), vitals, visits };
}

async function createPatient(input: CreatePatientInput): Promise<PatientDto> {
  const patient = await patientRepository.create(omitUndefined({ ...input }));
  logger.info("Patient registered", { patientId: patient.id });
  await activityService.logActivity({
    text: "New patient registered",
    type: "INFO",
  });
  return toDto(patient);
}

async function updatePatient(
  id: string,
  input: UpdatePatientInput,
): Promise<PatientDto> {
  const existing = await patientRepository.findById(id);
  if (!existing) throw new ServerError("Patient not found", 404);
  const updated = await patientRepository.update(
    id,
    omitUndefined({ ...input }),
  );
  return toDto(updated!);
}

async function deletePatient(id: string): Promise<void> {
  const existing = await patientRepository.findById(id);
  if (!existing) throw new ServerError("Patient not found", 404);
  await patientRepository.remove(id);
  logger.info("Patient deleted", { patientId: id });
  await activityService.logActivity({
    text: `Patient ${existing.name} deleted`,
    type: "WARNING",
  });
}

async function getPatientVitals(patientId: string): Promise<VitalSign[]> {
  await getPatientDetail(patientId);
  return patientRepository.listVitals(patientId);
}

async function addPatientVital(
  patientId: string,
  input: CreateVitalSignInput,
): Promise<VitalSign> {
  await getPatientDetail(patientId);
  const values: NewVitalSign = { patientId };
  if (input.heartRate !== undefined) values.heartRate = input.heartRate;
  if (input.bloodPressure !== undefined) values.bloodPressure = input.bloodPressure;
  if (input.temperature !== undefined) values.temperature = String(input.temperature);
  if (input.respiratoryRate !== undefined) values.respiratoryRate = input.respiratoryRate;
  if (input.oxygenSaturation !== undefined) values.oxygenSaturation = input.oxygenSaturation;
  if (input.notes !== undefined) values.notes = input.notes;
  return patientRepository.addVital(values);
}

async function getPatientVisits(patientId: string): Promise<VisitRecord[]> {
  await getPatientDetail(patientId);
  return patientRepository.listVisits(patientId);
}

async function addPatientVisit(
  patientId: string,
  input: CreateVisitRecordInput,
): Promise<VisitRecord> {
  await getPatientDetail(patientId);
  return patientRepository.addVisit(
    omitUndefined({ patientId, ...input }),
  );
}

export const patientService = {
  listPatients,
  getPatientDetail,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientVitals,
  addPatientVital,
  getPatientVisits,
  addPatientVisit,
};
