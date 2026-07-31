import { departmentEnum } from "@/shared/database/schema/schema.js";

export const DEPARTMENTS = departmentEnum.enumValues;

export type Department = (typeof departmentEnum.enumValues)[number];
