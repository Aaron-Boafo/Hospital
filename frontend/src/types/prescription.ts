import { PRESCRIPTION_STATUSES, DISPENSE_STATUSES } from '../constants/prescriptions'

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number]

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
