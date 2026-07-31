import { request } from '../api'
import type { CreatePrescriptionInput, PrescriptionDto } from '../types'

export async function fetchPrescriptions(patientId?: string): Promise<PrescriptionDto[]> {
  const { prescriptions } = await request.get<{ prescriptions: PrescriptionDto[] }>('/prescriptions', {
    params: patientId ? { patientId } : undefined,
  })
  return prescriptions
}

export async function fetchPrescription(id: string): Promise<PrescriptionDto> {
  const { prescription } = await request.get<{ prescription: PrescriptionDto }>(`/prescriptions/${id}`)
  return prescription
}

export async function createPrescription(input: CreatePrescriptionInput): Promise<PrescriptionDto> {
  const { prescription } = await request.post<{ prescription: PrescriptionDto }>('/prescriptions', input)
  return prescription
}

export async function dispensePrescription(id: string): Promise<PrescriptionDto> {
  const { prescription } = await request.post<{ prescription: PrescriptionDto }>(`/prescriptions/${id}/dispense`)
  return prescription
}
