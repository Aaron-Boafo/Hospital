import { genderEnum } from "@/shared/database/schema/schema.js";

export const GENDERS = genderEnum.enumValues;

export type Gender = (typeof genderEnum.enumValues)[number];
