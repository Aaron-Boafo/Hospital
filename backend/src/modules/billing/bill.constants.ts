import { billStatusEnum, paymentMethodEnum } from "@/shared/database/schema/schema.js";

export const BILL_STATUSES = billStatusEnum.enumValues;

export type BillStatus = (typeof billStatusEnum.enumValues)[number];

export const PAYMENT_METHODS = paymentMethodEnum.enumValues;

export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
