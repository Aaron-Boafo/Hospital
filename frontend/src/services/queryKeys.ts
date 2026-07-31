export const queryKeys = {
  auth: { me: ['auth', 'me'] },
  patients: {
    all: () => ['patients'],
    detail: (id: string) => ['patients', id],
    vitals: (id: string) => ['patients', id, 'vitals'],
    visits: (id: string) => ['patients', id, 'visits'],
  },
  doctors: {
    all: () => ['doctors'],
    detail: (id: string) => ['doctors', id],
  },
  appointments: {
    all: () => ['appointments'],
    detail: (id: string) => ['appointments', id],
  },
  bills: {
    all: () => ['bills'],
    detail: (id: string) => ['bills', id],
  },
  medicines: {
    all: () => ['medicines'],
    detail: (id: string) => ['medicines', id],
  },
  prescriptions: {
    all: () => ['prescriptions'],
    detail: (id: string) => ['prescriptions', id],
  },
  activities: {
    all: () => ['activities'],
  },
}
