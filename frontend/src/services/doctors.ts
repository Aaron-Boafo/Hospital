import { request } from '../api'
import type { Doctor, DoctorInput, QueryParams } from './types'

export async function fetchDoctors(params?: QueryParams): Promise<Doctor[]> {
  const { doctors } = await request.get<{ doctors: Doctor[] }>('/doctors', { params })
  return doctors
}

export async function fetchDoctor(id: string): Promise<Doctor> {
  const { doctor } = await request.get<{ doctor: Doctor }>(`/doctors/${id}`)
  return doctor
}

export async function createDoctor(payload: DoctorInput): Promise<Doctor> {
  const { doctor } = await request.post<{ doctor: Doctor }>('/doctors', payload)
  return doctor
}

export async function updateDoctor({
  id,
  ...payload
}: { id: string } & DoctorInput): Promise<Doctor> {
  const { doctor } = await request.put<{ doctor: Doctor }>(`/doctors/${id}`, payload)
  return doctor
}

export async function deleteDoctor(id: string): Promise<string> {
  await request.delete(`/doctors/${id}`)
  return id
}
