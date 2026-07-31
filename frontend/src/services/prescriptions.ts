import { request } from '../api'
import type { Prescription, PrescriptionInput, QueryParams } from './types'

export async function fetchPrescriptions(params?: QueryParams): Promise<Prescription[]> {
  const { prescriptions } = await request.get<{ prescriptions: Prescription[] }>('/prescriptions', {
    params,
  })
  return prescriptions
}

export async function fetchPrescription(id: string): Promise<Prescription> {
  const { prescription } = await request.get<{ prescription: Prescription }>(`/prescriptions/${id}`)
  return prescription
}

export async function createPrescription(payload: PrescriptionInput): Promise<Prescription> {
  const { prescription } = await request.post<{ prescription: Prescription }>(
    '/prescriptions',
    payload,
  )
  return prescription
}

export async function dispensePrescription(id: string): Promise<Prescription> {
  const { prescription } = await request.post<{ prescription: Prescription }>(
    `/prescriptions/${id}/dispense`,
  )
  return prescription
}
