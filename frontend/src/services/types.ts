export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type Department =
  | 'GENERAL MEDICINE'
  | 'PEDIATRICS'
  | 'CARDIOLOGY'
  | 'ORTHOPEDICS'
  | 'NEUROLOGY'
  | 'DERMATOLOGY'
  | 'ENT'
  | 'GYNECOLOGY'
  | 'OPHTHALMOLOGY'
export type MedicineCategory =
  | 'ANTIBIOTICS'
  | 'ANALGESICS'
  | 'ANTIHYPERTENSIVES'
  | 'ANTIDIABETICS'
  | 'ANTACIDS'
  | 'VITAMINS'
  | 'DERMATOLOGICAL'
  | 'RESPIRATORY'
  | 'CARDIOVASCULAR'
  | 'OTHER'
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type BillStatus = 'UNPAID' | 'PARTIAL' | 'PAID'
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE MONEY' | 'BANK TRANSFER'
export type PrescriptionStatus = 'PENDING' | 'DISPENSED' | 'PARTIAL'
export type DispenseStatus = 'DISPENSED' | 'PARTIAL'
export type ActivityType = 'ACCENT' | 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER'
export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'ACCOUNTANT'

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  email: string | null
  phone: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  name: string
  dob: string | null
  gender: Gender | null
  phone: string
  address: string | null
  emergencyContact: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientInput {
  name: string
  dob?: string | null
  gender?: Gender | null
  phone: string
  address?: string | null
  emergencyContact?: string | null
}

export interface VitalSign {
  id: string
  patientId: string
  heartRate: number | null
  bloodPressure: string | null
  temperature: string | null
  respiratoryRate: number | null
  oxygenSaturation: number | null
  notes: string | null
  recordedAt: string
}

export interface VitalSignInput {
  heartRate?: number | null
  bloodPressure?: string | null
  temperature?: number | null
  respiratoryRate?: number | null
  oxygenSaturation?: number | null
  notes?: string | null
}

export interface VisitRecord {
  id: string
  patientId: string
  visitDate: string
  reason: string | null
  diagnosis: string | null
  treatment: string | null
  notes: string | null
  createdAt: string
}

export interface VisitRecordInput {
  visitDate?: string
  reason?: string | null
  diagnosis?: string | null
  treatment?: string | null
  notes?: string | null
}

export interface Doctor {
  id: string
  name: string
  department: Department
  phone: string | null
  email: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface DoctorInput {
  name: string
  department: Department
  phone?: string | null
  email?: string | null
  active?: boolean
}

export interface Appointment {
  id: string
  patient: { id: string; name: string }
  doctor: { id: string; name: string }
  date: string
  time: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AppointmentInput {
  patientId: string
  doctorId: string
  date: string
  time: string
  notes?: string | null
}

export interface BillItem {
  id: string
  description: string
  amount: number
}

export interface BillItemInput {
  description: string
  amount: number
}

export interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export interface Bill {
  id: string
  patient: { id: string; name: string }
  total: number
  paid: number
  balanceDue: number
  status: BillStatus
  paymentMethod: PaymentMethod | null
  date: string
  items: BillItem[]
  payments: Payment[]
  createdAt: string
  updatedAt: string
}

export interface BillInput {
  patientId: string
  items: BillItemInput[]
}

export interface PaymentInput {
  amount: number
  method: PaymentMethod
}

export interface Medicine {
  id: string
  name: string
  category: MedicineCategory
  unitPrice: number
  quantity: number
  reorderLevel: number
  expiryDate: string | null
  supplier: string | null
  isLowStock: boolean
  isExpired: boolean
  isExpiringSoon: boolean
  createdAt: string
  updatedAt: string
}

export interface MedicineInput {
  name: string
  category: MedicineCategory
  unitPrice: number
  quantity?: number
  reorderLevel?: number
  expiryDate?: string | null
  supplier?: string | null
}

export interface PrescriptionItem {
  id: string
  medicine: { id: string; name: string }
  dosage: string
  frequency: string | null
  duration: string | null
  quantity: number
  dispensed: DispenseStatus | null
  total: number
}

export interface PrescriptionItemInput {
  medicineId: string
  dosage: string
  quantity: number
  frequency?: string | null
  duration?: string | null
}

export interface Prescription {
  id: string
  patient: { id: string; name: string }
  doctorName: string | null
  date: string
  status: PrescriptionStatus
  items: PrescriptionItem[]
  createdAt: string
  updatedAt: string
}

export interface PrescriptionInput {
  patientId: string
  doctorName?: string | null
  items: PrescriptionItemInput[]
}

export interface Activity {
  id: string
  text: string
  type: ActivityType
  time: string
}

export interface ActivityInput {
  text: string
  type?: ActivityType
}

export type QueryParams = Record<string, string | number | boolean | undefined>
