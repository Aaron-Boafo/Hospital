import { request } from '../api'
import type { Medicine, MedicineInput, QueryParams } from './types'

export async function fetchMedicines(params?: QueryParams): Promise<Medicine[]> {
  const { medicines } = await request.get<{ medicines: Medicine[] }>('/medicines', { params })
  return medicines
}

export async function fetchMedicine(id: string): Promise<Medicine> {
  const { medicine } = await request.get<{ medicine: Medicine }>(`/medicines/${id}`)
  return medicine
}

export async function createMedicine(payload: MedicineInput): Promise<Medicine> {
  const { medicine } = await request.post<{ medicine: Medicine }>('/medicines', payload)
  return medicine
}

export async function updateMedicine({
  id,
  ...payload
}: { id: string } & MedicineInput): Promise<Medicine> {
  const { medicine } = await request.put<{ medicine: Medicine }>(`/medicines/${id}`, payload)
  return medicine
}

export async function deleteMedicine(id: string): Promise<string> {
  await request.delete(`/medicines/${id}`)
  return id
}
