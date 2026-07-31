import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { billService } from "./bill.service.js";
import { BILL_STATUSES } from "./bill.constants.js";
import { createBillSchema, recordPaymentSchema } from "./bill.validation.js";

const uuidParam = z.uuid();
const statusParam = z.enum(BILL_STATUSES);

export const listBills = asyncHandler(async (req, res) => {
  const patientId =
    typeof req.query.patientId === "string" ? req.query.patientId : undefined;
  const status =
    typeof req.query.status === "string" ? statusParam.parse(req.query.status) : undefined;
  res.json({
    bills: await billService.listBills({
      ...(patientId ? { patientId: uuidParam.parse(patientId) } : {}),
      ...(status ? { status } : {}),
    }),
  });
});

export const getBill = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ bill: await billService.getBill(id) });
});

export const createBill = asyncHandler(async (req, res) => {
  const input = createBillSchema.parse(req.body);
  res.status(201).json({ bill: await billService.createBill(input) });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = recordPaymentSchema.parse(req.body);
  res.json({ bill: await billService.recordPayment(id, input) });
});
