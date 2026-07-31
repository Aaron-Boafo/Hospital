export const queryKeys = {
  patients: {
    all: ['patients'] as const,
    detail: (id: string) => ['patients', id] as const,
    vitals: (id: string) => ['patients', id, 'vitals'] as const,
    visits: (id: string) => ['patients', id, 'visits'] as const,
  },
  doctors: {
    all: ['doctors'] as const,
    detail: (id: string) => ['doctors', id] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    detail: (id: string) => ['appointments', id] as const,
  },
  bills: {
    all: ['bills'] as const,
    detail: (id: string) => ['bills', id] as const,
  },
  medicines: {
    all: ['medicines'] as const,
    detail: (id: string) => ['medicines', id] as const,
  },
  prescriptions: {
    all: ['prescriptions'] as const,
    detail: (id: string) => ['prescriptions', id] as const,
  },
  activities: {
    all: ['activities'] as const,
  },
  wards: {
    all: ['wards'] as const,
    detail: (id: string) => ['wards', id] as const,
  },
  beds: {
    all: ['beds'] as const,
    detail: (id: string) => ['beds', id] as const,
    assignments: ['beds', 'assignments'] as const,
  },
}
