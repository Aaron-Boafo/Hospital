import { activityTypeEnum } from "@/shared/database/schema/schema.js";

export const ACTIVITY_TYPES = activityTypeEnum.enumValues;

export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
