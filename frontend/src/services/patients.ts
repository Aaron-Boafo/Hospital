import { request } from '../api'
import type {
  CreatePatientInput,
  CreateVisitRecordInput,
  CreateVitalSignInput,
  PatientDetailDto,
  PatientDto,
  UpdatePatientInput,
  VisitRecordDto,
  VitalSignDto,
} from '../types'

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
