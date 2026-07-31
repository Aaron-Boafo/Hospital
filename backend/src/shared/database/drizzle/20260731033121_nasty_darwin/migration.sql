CREATE TYPE "activity_type" AS ENUM('ACCENT', 'INFO', 'SUCCESS', 'WARNING', 'DANGER');--> statement-breakpoint
CREATE TYPE "appointment_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "bed_status" AS ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "bill_status" AS ENUM('UNPAID', 'PARTIAL', 'PAID');--> statement-breakpoint
CREATE TYPE "department" AS ENUM('GENERAL MEDICINE', 'PEDIATRICS', 'CARDIOLOGY', 'ORTHOPEDICS', 'NEUROLOGY', 'DERMATOLOGY', 'ENT', 'GYNECOLOGY', 'OPHTHALMOLOGY');--> statement-breakpoint
CREATE TYPE "dispense_status" AS ENUM('DISPENSED', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "lab_status" AS ENUM('PENDING', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "lab_test_type" AS ENUM('COMPLETE BLOOD COUNT (CBC)', 'BLOOD GLUCOSE', 'LIPID PANEL', 'LIVER FUNCTION TEST', 'KIDNEY FUNCTION TEST', 'URINALYSIS', 'THYROID PANEL', 'BLOOD GROUPING & RH', 'HBA1C', 'ECG (ELECTROCARDIOGRAM)', 'CHEST X-RAY', 'MRI SCAN', 'CT SCAN', 'ULTRASOUND', 'MALARIA TEST', 'TYPHOID TEST', 'HIV TEST', 'HEPATITIS B TEST', 'PREGNANCY TEST', 'STOOL ANALYSIS');--> statement-breakpoint
CREATE TYPE "medicine_category" AS ENUM('ANTIBIOTICS', 'ANALGESICS', 'ANTIHYPERTENSIVES', 'ANTIDIABETICS', 'ANTACIDS', 'VITAMINS', 'DERMATOLOGICAL', 'RESPIRATORY', 'CARDIOVASCULAR', 'OTHER');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('CASH', 'CARD', 'MOBILE MONEY', 'BANK TRANSFER');--> statement-breakpoint
CREATE TYPE "prescription_status" AS ENUM('PENDING', 'DISPENSED', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'ACCOUNTANT');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"text" text NOT NULL,
	"type" "activity_type" DEFAULT 'INFO'::"activity_type" NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"status" "appointment_status" DEFAULT 'SCHEDULED'::"appointment_status" NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ward_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"status" "bed_status" DEFAULT 'AVAILABLE'::"bed_status" NOT NULL,
	"patient_id" uuid,
	"admitted_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bill_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bill_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"total" numeric(12,2) NOT NULL,
	"paid" numeric(12,2) DEFAULT '0' NOT NULL,
	"status" "bill_status" DEFAULT 'UNPAID'::"bill_status" NOT NULL,
	"payment_method" "payment_method",
	"date" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"department" "department" NOT NULL,
	"phone" text,
	"email" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"test_id" uuid NOT NULL UNIQUE,
	"results" text NOT NULL,
	"notes" text,
	"completed_by" text,
	"completed_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"test_type" "lab_test_type" NOT NULL,
	"ordered_by" text,
	"ordered_date" date DEFAULT now() NOT NULL,
	"status" "lab_status" DEFAULT 'PENDING'::"lab_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"category" "medicine_category" NOT NULL,
	"unit_price" numeric(12,2) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"expiry_date" date,
	"supplier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"dob" date,
	"gender" "gender" DEFAULT 'MALE'::"gender",
	"phone" text NOT NULL,
	"address" text,
	"emergency_contact" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bill_id" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"prescription_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text,
	"duration" text,
	"quantity" integer NOT NULL,
	"total" numeric(12,2) NOT NULL,
	"dispensed" "dispense_status"
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"doctor_name" text,
	"date" date DEFAULT now() NOT NULL,
	"status" "prescription_status" DEFAULT 'PENDING'::"prescription_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'RECEPTIONIST'::"user_role" NOT NULL,
	"email" text,
	"phone" text,
	"avatar_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visit_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"visit_date" date DEFAULT now() NOT NULL,
	"reason" text,
	"diagnosis" text,
	"treatment" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vital_signs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_id" uuid NOT NULL,
	"heart_rate" integer,
	"blood_pressure" text,
	"temperature" numeric(4,1),
	"respiratory_rate" integer,
	"oxygen_saturation" integer,
	"notes" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"total_beds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_logs_time_idx" ON "activity_logs" ("time");--> statement-breakpoint
CREATE INDEX "appointments_patient_id_idx" ON "appointments" ("patient_id");--> statement-breakpoint
CREATE INDEX "appointments_doctor_id_idx" ON "appointments" ("doctor_id");--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" ("date");--> statement-breakpoint
CREATE INDEX "beds_ward_id_idx" ON "beds" ("ward_id");--> statement-breakpoint
CREATE INDEX "beds_patient_id_idx" ON "beds" ("patient_id");--> statement-breakpoint
CREATE UNIQUE INDEX "beds_ward_id_number_idx" ON "beds" ("ward_id","number");--> statement-breakpoint
CREATE INDEX "bill_items_bill_id_idx" ON "bill_items" ("bill_id");--> statement-breakpoint
CREATE INDEX "bills_patient_id_idx" ON "bills" ("patient_id");--> statement-breakpoint
CREATE INDEX "bills_status_idx" ON "bills" ("status");--> statement-breakpoint
CREATE INDEX "doctors_department_idx" ON "doctors" ("department");--> statement-breakpoint
CREATE UNIQUE INDEX "lab_results_test_id_idx" ON "lab_results" ("test_id");--> statement-breakpoint
CREATE INDEX "lab_tests_patient_id_idx" ON "lab_tests" ("patient_id");--> statement-breakpoint
CREATE INDEX "lab_tests_status_idx" ON "lab_tests" ("status");--> statement-breakpoint
CREATE INDEX "medicines_name_idx" ON "medicines" ("name");--> statement-breakpoint
CREATE INDEX "medicines_expiry_date_idx" ON "medicines" ("expiry_date");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" ("name");--> statement-breakpoint
CREATE INDEX "patients_phone_idx" ON "patients" ("phone");--> statement-breakpoint
CREATE INDEX "payments_bill_id_idx" ON "payments" ("bill_id");--> statement-breakpoint
CREATE INDEX "payments_paid_at_idx" ON "payments" ("paid_at");--> statement-breakpoint
CREATE INDEX "prescription_items_prescription_id_idx" ON "prescription_items" ("prescription_id");--> statement-breakpoint
CREATE INDEX "prescription_items_medicine_id_idx" ON "prescription_items" ("medicine_id");--> statement-breakpoint
CREATE INDEX "prescriptions_patient_id_idx" ON "prescriptions" ("patient_id");--> statement-breakpoint
CREATE INDEX "visit_records_patient_id_idx" ON "visit_records" ("patient_id");--> statement-breakpoint
CREATE INDEX "vital_signs_patient_id_idx" ON "vital_signs" ("patient_id");--> statement-breakpoint
CREATE INDEX "vital_signs_recorded_at_idx" ON "vital_signs" ("recorded_at");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_ward_id_wards_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_bills_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_test_id_lab_tests_id_fkey" FOREIGN KEY ("test_id") REFERENCES "lab_tests"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_bills_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medicine_id_medicines_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;