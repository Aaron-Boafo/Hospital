import { medicineCategoryEnum } from "@/shared/database/schema/schema.js";

export const MEDICINE_CATEGORIES = medicineCategoryEnum.enumValues;

export type MedicineCategory = (typeof medicineCategoryEnum.enumValues)[number];
