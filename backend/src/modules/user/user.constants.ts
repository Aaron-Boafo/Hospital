import { userRoleEnum } from "@/shared/database/schema/schema.js";

export const USER_ROLES = userRoleEnum.enumValues;

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const PASSWORD_SENTINEL = "!firebase-auth!";
