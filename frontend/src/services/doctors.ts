import { request } from '../api'

export const DEPARTMENTS = [
  'GENERAL MEDICINE',
  'PEDIATRICS',
  'CARDIOLOGY',
  'ORTHOPEDICS',
  'NEUROLOGY',
  'DERMATOLOGY',
  'ENT',
  'GYNECOLOGY',
  'OPHTHALMOLOGY',
] as const
export type Department = (typeof DEPARTMENTS)[number]

export interface DoctorDto {
  id: string
  name: string
  department: Department
  phone: string | null
  email: string | null
  active: boolean
  createdAt: string
}

export interface CreateDoctorInput {
  name: string
  department: Department
  phone?: string | undefined
  email?: string | undefined
}

export type UpdateDoctorInput = {
  name?: string | undefined
  department?: Department | undefined
  phone?: string | undefined
  email?: string | undefined
}

export async function fetchDoctors(activeOnly?: boolean): Promise<DoctorDto[]> {
  const { doctors } = await request.get<{ doctors: DoctorDto[] }>('/doctors', {
    params: activeOnly ? { activeOnly: '1' } : undefined,
  })
  return doctors
}

export async function fetchDoctor(id: string): Promise<DoctorDto> {
  const { doctor } = await request.get<{ doctor: DoctorDto }>(`/doctors/${id}`)
  return doctor
}

export async function createDoctor(input: CreateDoctorInput): Promise<DoctorDto> {
  const { doctor } = await request.post<{ doctor: DoctorDto }>('/doctors', input)
  return doctor
}

export async function updateDoctor(id: string, input: UpdateDoctorInput): Promise<DoctorDto> {
  const { doctor } = await request.put<{ doctor: DoctorDto }>(`/doctors/${id}`, input)
  return doctor
}

export async function toggleDoctorActive(id: string, active: boolean): Promise<DoctorDto> {
  const { doctor } = await request.patch<{ doctor: DoctorDto }>(`/doctors/${id}/active`, { active })
  return doctor
}
