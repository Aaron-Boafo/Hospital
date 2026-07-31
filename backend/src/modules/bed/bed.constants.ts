import { bedStatusEnum, bedTypeEnum } from "@/shared/database/schema/schema.js";

export const BED_STATUSES = bedStatusEnum.enumValues;

export type BedStatus = (typeof bedStatusEnum.enumValues)[number];

export const BED_TYPES = bedTypeEnum.enumValues;

export type BedType = (typeof bedTypeEnum.enumValues)[number];
