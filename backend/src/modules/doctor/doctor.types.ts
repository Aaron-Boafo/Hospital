import type { Department } from "./doctor.constants.js";

export interface DoctorDto {
  id: string;
  name: string;
  department: Department;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt: Date;
}

export interface CreateDoctorInput {
  name: string;
  department: Department;
  phone?: string | undefined;
  email?: string | undefined;
}

export type UpdateDoctorInput = {
  name?: string | undefined;
  department?: Department | undefined;
  phone?: string | undefined;
  email?: string | undefined;
};
