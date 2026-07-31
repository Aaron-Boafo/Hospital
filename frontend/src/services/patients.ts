import { request } from '../api'

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const
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

export async function fetchPatients(search?: string): Promise<PatientDto[]> {
  const { patients } = await request.get<{ patients: PatientDto[] }>('/patients', {
    params: search ? { search } : undefined,
  })
  return patients
}

export async function fetchPatient(id: string): Promise<PatientDetailDto> {
  return request.get<PatientDetailDto>(`/patients/${id}`)
}

export async function createPatient(input: CreatePatientInput): Promise<PatientDto> {
  const { patient } = await request.post<{ patient: PatientDto }>('/patients', input)
  return patient
}

export async function updatePatient(id: string, input: UpdatePatientInput): Promise<PatientDto> {
  const { patient } = await request.put<{ patient: PatientDto }>(`/patients/${id}`, input)
  return patient
}

export async function deletePatient(id: string): Promise<void> {
  await request.delete(`/patients/${id}`)
}

export async function fetchVitals(patientId: string): Promise<VitalSignDto[]> {
  const { vitals } = await request.get<{ vitals: VitalSignDto[] }>(`/patients/${patientId}/vitals`)
  return vitals
}

export async function addVital(patientId: string, input: CreateVitalSignInput): Promise<VitalSignDto> {
  const { vital } = await request.post<{ vital: VitalSignDto }>(`/patients/${patientId}/vitals`, input)
  return vital
}

export async function fetchVisits(patientId: string): Promise<VisitRecordDto[]> {
  const { visits } = await request.get<{ visits: VisitRecordDto[] }>(`/patients/${patientId}/visits`)
  return visits
}

export async function addVisit(patientId: string, input: CreateVisitRecordInput): Promise<VisitRecordDto> {
  const { visit } = await request.post<{ visit: VisitRecordDto }>(`/patients/${patientId}/visits`, input)
  return visit
}
