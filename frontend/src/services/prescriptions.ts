import { request } from '../api'

export const PRESCRIPTION_STATUSES = ['PENDING', 'DISPENSED', 'PARTIAL'] as const
export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number]

export const DISPENSE_STATUSES = ['DISPENSED', 'PARTIAL'] as const
export type DispenseStatus = (typeof DISPENSE_STATUSES)[number]

export interface PrescriptionItemDto {
  id: string
  medicine: { id: string; name: string }
  dosage: string
  frequency: string | null
  duration: string | null
  quantity: number
  dispensed: DispenseStatus | null
  total: number
}

export interface PrescriptionDto {
  id: string
  patient: { id: string; name: string }
  doctorName: string | null
  date: string
  status: PrescriptionStatus
  items: PrescriptionItemDto[]
  createdAt: string
}

export interface PrescriptionItemInput {
  medicineId: string
  dosage: string
  quantity: number
  frequency?: string | undefined
  duration?: string | undefined
}

export interface CreatePrescriptionInput {
  patientId: string
  doctorName?: string | undefined
  items: PrescriptionItemInput[]
}

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
