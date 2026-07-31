import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { queryKeys } from '../services/queryKeys'
import type {
  Patient,
  PatientInput,
  QueryParams,
  VitalSign,
  VitalSignInput,
  VisitRecord,
  VisitRecordInput,
} from '../services/types'

export function usePatients(params?: QueryParams) {
  return useQuery<Patient[], Error>({
    queryKey: queryKeys.patients.all(),
    queryFn: () => fetchPatients(params),
  })
}

export function usePatient(id?: string) {
  return useQuery<Patient, Error>({
    queryKey: queryKeys.patients.detail(id ?? ''),
    queryFn: () => fetchPatient(id ?? ''),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation<Patient, Error, PatientInput>({
    mutationFn: createPatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients.all() }),
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation<Patient, Error, { id: string } & PatientInput>({
    mutationFn: updatePatient,
    onSuccess: (patient) => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all() })
      qc.invalidateQueries({ queryKey: queryKeys.patients.detail(patient.id) })
    },
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation<string, Error, string>({
    mutationFn: deletePatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients.all() }),
  })
}

export function useVitals(patientId?: string) {
  return useQuery<VitalSign[], Error>({
    queryKey: queryKeys.patients.vitals(patientId ?? ''),
    queryFn: () => fetchVitals(patientId ?? ''),
    enabled: !!patientId,
  })
}

export function useAddVital(patientId: string) {
  const qc = useQueryClient()
  return useMutation<VitalSign, Error, VitalSignInput>({
    mutationFn: (payload) => addVital(patientId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients.vitals(patientId) }),
  })
}

export function useVisits(patientId?: string) {
  return useQuery<VisitRecord[], Error>({
    queryKey: queryKeys.patients.visits(patientId ?? ''),
    queryFn: () => fetchVisits(patientId ?? ''),
    enabled: !!patientId,
  })
}

export function useAddVisit(patientId: string) {
  const qc = useQueryClient()
  return useMutation<VisitRecord, Error, VisitRecordInput>({
    mutationFn: (payload) => addVisit(patientId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients.visits(patientId) }),
  })
}
