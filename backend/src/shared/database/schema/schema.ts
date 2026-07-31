import {
  pgTable,
  pgEnum,
  uuid,
  text,
  date,
  time,
  timestamp,
  boolean,
  integer,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { defineRelations, sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "ACCOUNTANT",
]);

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

export const departmentEnum = pgEnum("department", [
  "GENERAL MEDICINE",
  "PEDIATRICS",
  "CARDIOLOGY",
  "ORTHOPEDICS",
  "NEUROLOGY",
  "DERMATOLOGY",
  "ENT",
  "GYNECOLOGY",
  "OPHTHALMOLOGY",
]);

export const medicineCategoryEnum = pgEnum("medicine_category", [
  "ANTIBIOTICS",
  "ANALGESICS",
  "ANTIHYPERTENSIVES",
  "ANTIDIABETICS",
  "ANTACIDS",
  "VITAMINS",
  "DERMATOLOGICAL",
  "RESPIRATORY",
  "CARDIOVASCULAR",
  "OTHER",
]);

export const labTestTypeEnum = pgEnum("lab_test_type", [
  "COMPLETE BLOOD COUNT (CBC)",
  "BLOOD GLUCOSE",
  "LIPID PANEL",
  "LIVER FUNCTION TEST",
  "KIDNEY FUNCTION TEST",
  "URINALYSIS",
  "THYROID PANEL",
  "BLOOD GROUPING & RH",
  "HBA1C",
  "ECG (ELECTROCARDIOGRAM)",
  "CHEST X-RAY",
  "MRI SCAN",
  "CT SCAN",
  "ULTRASOUND",
  "MALARIA TEST",
  "TYPHOID TEST",
  "HIV TEST",
  "HEPATITIS B TEST",
  "PREGNANCY TEST",
  "STOOL ANALYSIS",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
]);

export const billStatusEnum = pgEnum("bill_status", [
  "UNPAID",
  "PARTIAL",
  "PAID",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "CARD",
  "MOBILE MONEY",
  "BANK TRANSFER",
]);

export const labStatusEnum = pgEnum("lab_status", ["PENDING", "COMPLETED"]);

export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "PENDING",
  "DISPENSED",
  "PARTIAL",
]);

export const dispenseStatusEnum = pgEnum("dispense_status", [
  "DISPENSED",
  "PARTIAL",
]);

export const bedStatusEnum = pgEnum("bed_status", [
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "RESERVED",
]);

export const bedTypeEnum = pgEnum("bed_type", [
  "STANDARD",
  "PRIVATE",
  "ICU",
  "EMERGENCY",
  "MATERNITY",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "ACCENT",
  "INFO",
  "SUCCESS",
  "WARNING",
  "DANGER",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("RECEPTIONIST"),
  email: text("email"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    dob: date("dob"),
    gender: genderEnum("gender").default("MALE"),
    phone: text("phone").notNull(),
    address: text("address"),
    emergencyContact: text("emergency_contact"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("patients_name_idx").on(table.name),
    index("patients_phone_idx").on(table.phone),
  ],
);

export const doctors = pgTable(
  "doctors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    department: departmentEnum("department").notNull(),
    phone: text("phone"),
    email: text("email"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("doctors_department_idx").on(table.department)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "restrict" }),
    date: date("date").notNull(),
    time: time("time").notNull(),
    status: appointmentStatusEnum("status").notNull().default("SCHEDULED"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("appointments_patient_id_idx").on(table.patientId),
    index("appointments_doctor_id_idx").on(table.doctorId),
    index("appointments_date_idx").on(table.date),
  ],
);

export const bills = pgTable(
  "bills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    paid: numeric("paid", { precision: 12, scale: 2 }).notNull().default("0"),
    status: billStatusEnum("status").notNull().default("UNPAID"),
    paymentMethod: paymentMethodEnum("payment_method"),
    date: date("date").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("bills_patient_id_idx").on(table.patientId),
    index("bills_status_idx").on(table.status),
  ],
);

export const billItems = pgTable(
  "bill_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [index("bill_items_bill_id_idx").on(table.billId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    method: paymentMethodEnum("method").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payments_bill_id_idx").on(table.billId),
    index("payments_paid_at_idx").on(table.paidAt),
  ],
);

export const medicines = pgTable(
  "medicines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    category: medicineCategoryEnum("category").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(0),
    reorderLevel: integer("reorder_level").notNull().default(0),
    expiryDate: date("expiry_date"),
    supplier: text("supplier"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("medicines_name_idx").on(table.name),
    index("medicines_expiry_date_idx").on(table.expiryDate),
  ],
);

export const prescriptions = pgTable(
  "prescriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    doctorName: text("doctor_name"),
    date: date("date").notNull().defaultNow(),
    status: prescriptionStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("prescriptions_patient_id_idx").on(table.patientId)],
);

export const prescriptionItems = pgTable(
  "prescription_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    prescriptionId: uuid("prescription_id")
      .notNull()
      .references(() => prescriptions.id, { onDelete: "cascade" }),
    medicineId: uuid("medicine_id")
      .notNull()
      .references(() => medicines.id, { onDelete: "restrict" }),
    dosage: text("dosage").notNull(),
    frequency: text("frequency"),
    duration: text("duration"),
    quantity: integer("quantity").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    dispensed: dispenseStatusEnum("dispensed"),
  },
  (table) => [
    index("prescription_items_prescription_id_idx").on(table.prescriptionId),
    index("prescription_items_medicine_id_idx").on(table.medicineId),
  ],
);

export const labTests = pgTable(
  "lab_tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    testType: labTestTypeEnum("test_type").notNull(),
    orderedBy: text("ordered_by"),
    orderedDate: date("ordered_date").notNull().defaultNow(),
    status: labStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("lab_tests_patient_id_idx").on(table.patientId),
    index("lab_tests_status_idx").on(table.status),
  ],
);

export const labResults = pgTable(
  "lab_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id")
      .notNull()
      .unique()
      .references(() => labTests.id, { onDelete: "cascade" }),
    results: text("results").notNull(),
    notes: text("notes"),
    completedBy: text("completed_by"),
    completedDate: timestamp("completed_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("lab_results_test_id_idx").on(table.testId)],
);

export const wards = pgTable("wards", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  totalBeds: integer("total_beds").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const beds = pgTable(
  "beds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wardId: uuid("ward_id")
      .notNull()
      .references(() => wards.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    bedType: bedTypeEnum("bed_type").notNull().default("STANDARD"),
    status: bedStatusEnum("status").notNull().default("AVAILABLE"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("beds_ward_id_idx").on(table.wardId),
    uniqueIndex("beds_ward_id_number_idx").on(table.wardId, table.number),
  ],
);

export const bedAssignments = pgTable(
  "bed_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bedId: uuid("bed_id")
      .notNull()
      .references(() => beds.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => users.id, {
      onDelete: "set null",
    }),
    admittedAt: timestamp("admitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dischargedAt: timestamp("discharged_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("bed_assignments_bed_id_idx").on(table.bedId, table.dischargedAt),
    index("bed_assignments_patient_id_idx").on(table.patientId),
    index("bed_assignments_admitted_at_idx").on(table.admittedAt),
    uniqueIndex("bed_assignments_active_bed_idx")
      .on(table.bedId)
      .where(sql`${table.dischargedAt} IS NULL`),
    uniqueIndex("bed_assignments_active_patient_idx")
      .on(table.patientId)
      .where(sql`${table.dischargedAt} IS NULL`),
  ],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    text: text("text").notNull(),
    type: activityTypeEnum("type").notNull().default("INFO"),
    time: timestamp("time", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("activity_logs_time_idx").on(table.time)],
);

export const vitalSigns = pgTable(
  "vital_signs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    heartRate: integer("heart_rate"),
    bloodPressure: text("blood_pressure"),
    temperature: numeric("temperature", { precision: 4, scale: 1 }),
    respiratoryRate: integer("respiratory_rate"),
    oxygenSaturation: integer("oxygen_saturation"),
    notes: text("notes"),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("vital_signs_patient_id_idx").on(table.patientId),
    index("vital_signs_recorded_at_idx").on(table.recordedAt),
  ],
);

export const visitRecords = pgTable(
  "visit_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    visitDate: date("visit_date").notNull().defaultNow(),
    reason: text("reason"),
    diagnosis: text("diagnosis"),
    treatment: text("treatment"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("visit_records_patient_id_idx").on(table.patientId)],
);

const schema = {
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
};

export const relations = defineRelations(schema, (r) => ({
  users: {
    bedAssignments: r.many.bedAssignments(),
  },
  patients: {
    appointments: r.many.appointments(),
    bills: r.many.bills(),
    labTests: r.many.labTests(),
    prescriptions: r.many.prescriptions(),
    bedAssignments: r.many.bedAssignments(),
    vitalSigns: r.many.vitalSigns(),
    visitRecords: r.many.visitRecords(),
  },
  doctors: {
    appointments: r.many.appointments(),
  },
  appointments: {
    patient: r.one.patients({
      from: r.appointments.patientId,
      to: r.patients.id,
    }),
    doctor: r.one.doctors({
      from: r.appointments.doctorId,
      to: r.doctors.id,
    }),
  },
  bills: {
    patient: r.one.patients({
      from: r.bills.patientId,
      to: r.patients.id,
    }),
    items: r.many.billItems(),
    payments: r.many.payments(),
  },
  billItems: {
    bill: r.one.bills({
      from: r.billItems.billId,
      to: r.bills.id,
    }),
  },
  payments: {
    bill: r.one.bills({
      from: r.payments.billId,
      to: r.bills.id,
    }),
  },
  medicines: {
    prescriptionItems: r.many.prescriptionItems(),
  },
  prescriptions: {
    patient: r.one.patients({
      from: r.prescriptions.patientId,
      to: r.patients.id,
    }),
    items: r.many.prescriptionItems(),
  },
  prescriptionItems: {
    prescription: r.one.prescriptions({
      from: r.prescriptionItems.prescriptionId,
      to: r.prescriptions.id,
    }),
    medicine: r.one.medicines({
      from: r.prescriptionItems.medicineId,
      to: r.medicines.id,
    }),
  },
  labTests: {
    patient: r.one.patients({
      from: r.labTests.patientId,
      to: r.patients.id,
    }),
    result: r.one.labResults({
      from: r.labTests.id,
      to: r.labResults.testId,
    }),
  },
  labResults: {
    test: r.one.labTests({
      from: r.labResults.testId,
      to: r.labTests.id,
    }),
  },
  wards: {
    beds: r.many.beds(),
  },
  beds: {
    ward: r.one.wards({
      from: r.beds.wardId,
      to: r.wards.id,
    }),
    assignments: r.many.bedAssignments(),
  },
  bedAssignments: {
    bed: r.one.beds({
      from: r.bedAssignments.bedId,
      to: r.beds.id,
    }),
    patient: r.one.patients({
      from: r.bedAssignments.patientId,
      to: r.patients.id,
    }),
    assignedByUser: r.one.users({
      from: r.bedAssignments.assignedBy,
      to: r.users.id,
    }),
  },
  activityLogs: {},
  vitalSigns: {
    patient: r.one.patients({
      from: r.vitalSigns.patientId,
      to: r.patients.id,
    }),
  },
  visitRecords: {
    patient: r.one.patients({
      from: r.visitRecords.patientId,
      to: r.patients.id,
    }),
  },
}));
