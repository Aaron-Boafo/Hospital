import { request } from '../api'
import type { CreateMedicineInput, MedicineDto, UpdateMedicineInput } from '../types'

export async function fetchMedicines(): Promise<MedicineDto[]> {
  const { medicines } = await request.get<{ medicines: MedicineDto[] }>('/medicines')
  return medicines
}

export async function fetchMedicine(id: string): Promise<MedicineDto> {
  const { medicine } = await request.get<{ medicine: MedicineDto }>(`/medicines/${id}`)
  return medicine
}

export async function createMedicine(input: CreateMedicineInput): Promise<MedicineDto> {
  const { medicine } = await request.post<{ medicine: MedicineDto }>('/medicines', input)
  return medicine
}

export async function updateMedicine(id: string, input: UpdateMedicineInput): Promise<MedicineDto> {
  const { medicine } = await request.put<{ medicine: MedicineDto }>(`/medicines/${id}`, input)
  return medicine
}

export async function deleteMedicine(id: string): Promise<void> {
  await request.delete(`/medicines/${id}`)
}
