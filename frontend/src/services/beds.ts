import { request } from '../api'
import type {
  AdmitInput,
  BedAssignmentDto,
  BedDto,
  CreateBedInput,
  CreateWardInput,
  UpdateBedInput,
  UpdateWardInput,
  WardDto,
} from '../types'

export async function fetchWards(): Promise<WardDto[]> {
  const { wards } = await request.get<{ wards: WardDto[] }>('/wards')
  return wards
}

export async function createWard(input: CreateWardInput): Promise<WardDto> {
  const { ward } = await request.post<{ ward: WardDto }>('/wards', input)
  return ward
}

export async function updateWard(id: string, input: UpdateWardInput): Promise<WardDto> {
  const { ward } = await request.put<{ ward: WardDto }>(`/wards/${id}`, input)
  return ward
}

export async function deleteWard(id: string): Promise<void> {
  await request.delete(`/wards/${id}`)
}

export async function fetchBeds(): Promise<BedDto[]> {
  const { beds } = await request.get<{ beds: BedDto[] }>('/beds')
  return beds
}

export async function createBed(input: CreateBedInput): Promise<BedDto> {
  const { bed } = await request.post<{ bed: BedDto }>('/beds', input)
  return bed
}

export async function updateBed(id: string, input: UpdateBedInput): Promise<BedDto> {
  const { bed } = await request.put<{ bed: BedDto }>(`/beds/${id}`, input)
  return bed
}

export async function deleteBed(id: string): Promise<void> {
  await request.delete(`/beds/${id}`)
}

export async function admitToBed(bedId: string, input: AdmitInput): Promise<BedAssignmentDto> {
  const { assignment } = await request.post<{ assignment: BedAssignmentDto }>(
    `/beds/${bedId}/admit`,
    input,
  )
  return assignment
}

export async function dischargeFromBed(bedId: string): Promise<BedAssignmentDto> {
  const { assignment } = await request.post<{ assignment: BedAssignmentDto }>(
    `/beds/${bedId}/discharge`,
  )
  return assignment
}

export async function fetchBedAssignments(): Promise<BedAssignmentDto[]> {
  const { assignments } = await request.get<{ assignments: BedAssignmentDto[] }>('/bed-assignments')
  return assignments
}
