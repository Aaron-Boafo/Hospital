import { request } from '../api'
import type { CreateDoctorInput, DoctorDto, UpdateDoctorInput } from '../types'

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
