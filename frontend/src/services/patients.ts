import { request } from '../api'
import type {
  Patient,
  PatientInput,
  QueryParams,
  VitalSign,
  VitalSignInput,
  VisitRecord,
  VisitRecordInput,
} from './types'

export async function fetchPatients(params?: QueryParams): Promise<Patient[]> {
  const { patients } = await request.get<{ patients: Patient[] }>('/patients', { params })
  return patients
}

export async function fetchPatient(id: string): Promise<Patient> {
  const { patient } = await request.get<{ patient: Patient }>(`/patients/${id}`)
  return patient
}

export async function createPatient(payload: PatientInput): Promise<Patient> {
  const { patient } = await request.post<{ patient: Patient }>('/patients', payload)
  return patient
}

export async function updatePatient({
  id,
  ...payload
}: { id: string } & PatientInput): Promise<Patient> {
  const { patient } = await request.put<{ patient: Patient }>(`/patients/${id}`, payload)
  return patient
}

export async function deletePatient(id: string): Promise<string> {
  await request.delete(`/patients/${id}`)
  return id
}

export async function fetchVitals(patientId: string): Promise<VitalSign[]> {
  const { vitals } = await request.get<{ vitals: VitalSign[] }>(`/patients/${patientId}/vitals`)
  return vitals
}

export async function addVital(
  patientId: string,
  payload: VitalSignInput,
): Promise<VitalSign> {
  const { vital } = await request.post<{ vital: VitalSign }>(
    `/patients/${patientId}/vitals`,
    payload,
  )
  return vital
}

export async function fetchVisits(patientId: string): Promise<VisitRecord[]> {
  const { visits } = await request.get<{ visits: VisitRecord[] }>(`/patients/${patientId}/visits`)
  return visits
}

export async function addVisit(
  patientId: string,
  payload: VisitRecordInput,
): Promise<VisitRecord> {
  const { visit } = await request.post<{ visit: VisitRecord }>(
    `/patients/${patientId}/visits`,
    payload,
  )
  return visit
}
