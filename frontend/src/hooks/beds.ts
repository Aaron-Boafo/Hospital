import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  admitToBed,
  createBed,
  createWard,
  deleteBed,
  deleteWard,
  dischargeFromBed,
  fetchBedAssignments,
  fetchBeds,
  fetchWards,
  updateBed,
  updateWard,
} from '../services/beds'
import type { AdmitInput, CreateBedInput, CreateWardInput, UpdateBedInput, UpdateWardInput } from '../types'

export function useWards() {
  return useQuery({
    queryKey: queryKeys.wards.all,
    queryFn: fetchWards,
  })
}

export function useBeds() {
  return useQuery({
    queryKey: queryKeys.beds.all,
    queryFn: fetchBeds,
  })
}

export function useBedAssignments() {
  return useQuery({
    queryKey: queryKeys.beds.assignments,
    queryFn: fetchBedAssignments,
  })
}

export function useCreateWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWardInput) => createWard(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wards.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
    },
  })
}

export function useUpdateWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWardInput }) => updateWard(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wards.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
    },
  })
}

export function useDeleteWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWard(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wards.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
    },
  })
}

export function useCreateBed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBedInput) => createBed(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.wards.all })
    },
  })
}

export function useUpdateBed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBedInput }) => updateBed(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
    },
  })
}

export function useDeleteBed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBed(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.wards.all })
    },
  })
}

export function useAdmitToBed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bedId, input }: { bedId: string; input: AdmitInput }) => admitToBed(bedId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.assignments })
    },
  })
}

export function useDischargeFromBed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bedId: string) => dischargeFromBed(bedId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.beds.assignments })
    },
  })
}
