import type { BedStatus, BedType } from "./bed.constants.js";

export interface WardDto {
  id: string;
  name: string;
  totalBeds: number;
  beds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BedDto {
  id: string;
  wardId: string;
  number: number;
  bedType: BedType;
  status: BedStatus;
  ward: { id: string; name: string; totalBeds: number } | null;
  patient: { id: string; name: string } | null;
  admittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BedAssignmentDto {
  id: string;
  bed: { id: string; number: number; ward: { id: string; name: string } };
  patient: { id: string; name: string };
  assignedBy: { id: string; name: string } | null;
  admittedAt: Date;
  dischargedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWardInput {
  name: string;
  totalBeds: number;
}

export interface UpdateWardInput {
  name?: string | undefined;
  totalBeds?: number | undefined;
}

export interface CreateBedInput {
  wardId: string;
  number: number;
  bedType?: BedType | undefined;
}

export interface UpdateBedInput {
  number?: number | undefined;
  bedType?: BedType | undefined;
  status?: Extract<BedStatus, "AVAILABLE" | "MAINTENANCE" | "RESERVED"> | undefined;
}

export interface AdmitInput {
  patientId: string;
}
