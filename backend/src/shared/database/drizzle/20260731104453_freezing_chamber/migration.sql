CREATE TYPE "bed_type" AS ENUM('STANDARD', 'PRIVATE', 'ICU', 'EMERGENCY', 'MATERNITY');--> statement-breakpoint
ALTER TYPE "bed_status" ADD VALUE 'RESERVED';--> statement-breakpoint
CREATE TABLE "bed_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bed_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"assigned_by" uuid,
	"admitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"discharged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beds" DROP CONSTRAINT "beds_patient_id_patients_id_fkey";--> statement-breakpoint
DROP INDEX "beds_patient_id_idx";--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "bed_type" "bed_type" DEFAULT 'STANDARD'::"bed_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "beds" DROP COLUMN "patient_id";--> statement-breakpoint
ALTER TABLE "beds" DROP COLUMN "admitted_date";--> statement-breakpoint
CREATE INDEX "bed_assignments_bed_id_idx" ON "bed_assignments" ("bed_id","discharged_at");--> statement-breakpoint
CREATE INDEX "bed_assignments_patient_id_idx" ON "bed_assignments" ("patient_id");--> statement-breakpoint
CREATE INDEX "bed_assignments_admitted_at_idx" ON "bed_assignments" ("admitted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "bed_assignments_active_bed_idx" ON "bed_assignments" ("bed_id") WHERE "discharged_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "bed_assignments_active_patient_idx" ON "bed_assignments" ("patient_id") WHERE "discharged_at" IS NULL;--> statement-breakpoint
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_bed_id_beds_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_patient_id_patients_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_assigned_by_users_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL;