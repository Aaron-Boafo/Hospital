import { dispenseStatusEnum, prescriptionStatusEnum } from "@/shared/database/schema/schema.js";

export const PRESCRIPTION_STATUSES = prescriptionStatusEnum.enumValues;

export type PrescriptionStatus = (typeof prescriptionStatusEnum.enumValues)[number];

export const DISPENSE_STATUSES = dispenseStatusEnum.enumValues;

export type DispenseStatus = (typeof dispenseStatusEnum.enumValues)[number];
