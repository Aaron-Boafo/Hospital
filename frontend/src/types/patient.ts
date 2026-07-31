import { GENDERS } from '../constants/patients'

export type Gender = (typeof GENDERS)[number]

export interface PatientDto {
  id: string
  name: string
  dob: string | null
  gender: Gender | null
  phone: string
  address: string | null
  emergencyContact: string | null
  createdAt: string
}

export interface VitalSignDto {
  id: string
  patientId: string
  heartRate: number | null
  bloodPressure: string | null
  temperature: string | null
  respiratoryRate: number | null
  oxygenSaturation: number | null
  notes: string | null
  recordedAt: string
}

export interface VisitRecordDto {
  id: string
  patientId: string
  visitDate: string
  reason: string | null
  diagnosis: string | null
  treatment: string | null
  notes: string | null
  createdAt: string
}

export interface PatientDetailDto {
  patient: PatientDto
  vitals: VitalSignDto[]
  visits: VisitRecordDto[]
}

export interface CreatePatientInput {
  name: string
  phone: string
  dob?: string | undefined
  gender?: Gender | undefined
  address?: string | undefined
  emergencyContact?: string | undefined
}

export type UpdatePatientInput = {
  name?: string | undefined
  phone?: string | undefined
  dob?: string | undefined
  gender?: Gender | undefined
  address?: string | undefined
  emergencyContact?: string | undefined
}

export interface CreateVitalSignInput {
  heartRate?: number | undefined
  bloodPressure?: string | undefined
  temperature?: number | undefined
  respiratoryRate?: number | undefined
  oxygenSaturation?: number | undefined
  notes?: string | undefined
}

export interface CreateVisitRecordInput {
  visitDate?: string | undefined
  reason?: string | undefined
  diagnosis?: string | undefined
  treatment?: string | undefined
  notes?: string | undefined
}
