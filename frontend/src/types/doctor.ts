import { DEPARTMENTS } from '../constants/doctors'

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
