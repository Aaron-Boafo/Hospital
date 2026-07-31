import { appointmentStatusEnum } from "@/shared/database/schema/schema.js";

export const APPOINTMENT_STATUSES = appointmentStatusEnum.enumValues;

export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
