import { request } from '../api'

export const MEDICINE_CATEGORIES = [
  'ANTIBIOTICS',
  'ANALGESICS',
  'ANTIHYPERTENSIVES',
  'ANTIDIABETICS',
  'ANTACIDS',
  'VITAMINS',
  'DERMATOLOGICAL',
  'RESPIRATORY',
  'CARDIOVASCULAR',
  'OTHER',
] as const
export type MedicineCategory = (typeof MEDICINE_CATEGORIES)[number]

export interface MedicineDto {
  id: string
  name: string
  category: MedicineCategory
  unitPrice: number
  quantity: number
  reorderLevel: number
  expiryDate: string | null
  supplier: string | null
  createdAt: string
  isLowStock: boolean
  isExpired: boolean
  isExpiringSoon: boolean
}

export interface CreateMedicineInput {
  name: string
  category: MedicineCategory
  unitPrice: number
  quantity: number
  reorderLevel?: number | undefined
  expiryDate?: string | undefined
  supplier?: string | undefined
}

export type UpdateMedicineInput = {
  name?: string | undefined
  category?: MedicineCategory | undefined
  unitPrice?: number | undefined
  quantity?: number | undefined
  reorderLevel?: number | undefined
  expiryDate?: string | undefined
  supplier?: string | undefined
}

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
