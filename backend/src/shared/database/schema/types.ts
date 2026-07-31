import {
  users,
  patients,
  doctors,
  appointments,
  bills,
  billItems,
  payments,
  medicines,
  prescriptions,
  prescriptionItems,
  labTests,
  labResults,
  wards,
  beds,
  bedAssignments,
  activityLogs,
  vitalSigns,
  visitRecords,
} from "./schema.js";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;

export type BillItem = typeof billItems.$inferSelect;
export type NewBillItem = typeof billItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type NewPrescriptionItem = typeof prescriptionItems.$inferInsert;

export type LabTest = typeof labTests.$inferSelect;
export type NewLabTest = typeof labTests.$inferInsert;

export type LabResult = typeof labResults.$inferSelect;
export type NewLabResult = typeof labResults.$inferInsert;

export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;

export type Bed = typeof beds.$inferSelect;
export type NewBed = typeof beds.$inferInsert;

export type BedAssignment = typeof bedAssignments.$inferSelect;
export type NewBedAssignment = typeof bedAssignments.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type VitalSign = typeof vitalSigns.$inferSelect;
export type NewVitalSign = typeof vitalSigns.$inferInsert;

export type VisitRecord = typeof visitRecords.$inferSelect;
export type NewVisitRecord = typeof visitRecords.$inferInsert;
