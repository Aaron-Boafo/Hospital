import type { Gender } from "./patient.constants.js";
import type { VitalSign, VisitRecord } from "@/shared/database/schema/types.js";

export interface PatientDto {
  id: string;
  name: string;
  dob: string | null;
  gender: Gender | null;
  phone: string;
  address: string | null;
  emergencyContact: string | null;
  createdAt: Date;
}

export interface PatientDetailDto {
  patient: PatientDto;
  vitals: VitalSign[];
  visits: VisitRecord[];
}

export interface CreatePatientInput {
  name: string;
  phone: string;
  dob?: string | undefined;
  gender?: Gender | undefined;
  address?: string | undefined;
  emergencyContact?: string | undefined;
}

export type UpdatePatientInput = {
  name?: string | undefined;
  phone?: string | undefined;
  dob?: string | undefined;
  gender?: Gender | undefined;
  address?: string | undefined;
  emergencyContact?: string | undefined;
};

export interface CreateVitalSignInput {
  heartRate?: number | undefined;
  bloodPressure?: string | undefined;
  temperature?: number | undefined;
  respiratoryRate?: number | undefined;
  oxygenSaturation?: number | undefined;
  notes?: string | undefined;
}

export interface CreateVisitRecordInput {
  visitDate?: string | undefined;
  reason?: string | undefined;
  diagnosis?: string | undefined;
  treatment?: string | undefined;
  notes?: string | undefined;
}
