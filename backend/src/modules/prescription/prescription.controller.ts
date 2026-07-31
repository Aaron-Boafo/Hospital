import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { prescriptionService } from "./prescription.service.js";
import { createPrescriptionSchema } from "./prescription.validation.js";

const uuidParam = z.uuid();

export const listPrescriptions = asyncHandler(async (req, res) => {
  const patientId =
    typeof req.query.patientId === "string" ? uuidParam.parse(req.query.patientId) : undefined;
  res.json({
    prescriptions: await prescriptionService.listPrescriptions({
      ...(patientId ? { patientId } : {}),
    }),
  });
});

export const getPrescription = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ prescription: await prescriptionService.getPrescription(id) });
});

export const createPrescription = asyncHandler(async (req, res) => {
  const input = createPrescriptionSchema.parse(req.body);
  res.status(201).json({
    prescription: await prescriptionService.createPrescription(input),
  });
});

export const dispensePrescription = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({
    prescription: await prescriptionService.dispensePrescription(id),
  });
});
