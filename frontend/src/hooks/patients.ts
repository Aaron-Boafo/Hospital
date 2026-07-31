import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  addVital,
  addVisit,
  createPatient,
  deletePatient,
  fetchPatient,
  fetchPatients,
  fetchVisits,
  fetchVitals,
  updatePatient,
} from '../services/patients'
import type {
  CreatePatientInput,
  CreateVitalSignInput,
  CreateVisitRecordInput,
  UpdatePatientInput,
} from '../services/patients'

export function usePatients(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.patients.all, search ?? ''],
    queryFn: () => fetchPatients(search),
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id ?? ''),
    queryFn: () => fetchPatient(id ?? ''),
    enabled: Boolean(id),
  })
}

export function usePatientVitals(patientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.vitals(patientId ?? ''),
    queryFn: () => fetchVitals(patientId ?? ''),
    enabled: Boolean(patientId),
  })
}

export function usePatientVisits(patientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.visits(patientId ?? ''),
    queryFn: () => fetchVisits(patientId ?? ''),
    enabled: Boolean(patientId),
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePatientInput) => createPatient(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePatientInput }) => updatePatient(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(id) })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
    },
  })
}

export function useAddVital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, input }: { patientId: string; input: CreateVitalSignInput }) =>
      addVital(patientId, input),
    onSuccess: (_data, { patientId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.vitals(patientId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) })
    },
  })
}

export function useAddVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, input }: { patientId: string; input: CreateVisitRecordInput }) =>
      addVisit(patientId, input),
    onSuccess: (_data, { patientId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.visits(patientId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) })
    },
  })
}
