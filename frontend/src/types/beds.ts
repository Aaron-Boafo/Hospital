export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'

export type BedType = 'STANDARD' | 'PRIVATE' | 'ICU' | 'EMERGENCY' | 'MATERNITY'

export interface WardDto {
  id: string
  name: string
  totalBeds: number
  beds: number
  createdAt: string
  updatedAt: string
}

export interface BedDto {
  id: string
  wardId: string
  number: number
  bedType: BedType
  status: BedStatus
  ward: { id: string; name: string; totalBeds: number } | null
  patient: { id: string; name: string } | null
  admittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BedAssignmentDto {
  id: string
  bed: { id: string; number: number; ward: { id: string; name: string } }
  patient: { id: string; name: string }
  assignedBy: { id: string; name: string } | null
  admittedAt: string
  dischargedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateWardInput {
  name: string
  totalBeds: number
}

export interface UpdateWardInput {
  name?: string | undefined
  totalBeds?: number | undefined
}

export interface CreateBedInput {
  wardId: string
  number: number
  bedType?: BedType | undefined
}

export interface UpdateBedInput {
  number?: number | undefined
  bedType?: BedType | undefined
  status?: Exclude<BedStatus, 'OCCUPIED'> | undefined
}

export interface AdmitInput {
  patientId: string
}
