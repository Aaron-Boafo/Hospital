import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { medicineService } from "./medicine.service.js";
import { createMedicineSchema, updateMedicineSchema } from "./medicine.validation.js";

const uuidParam = z.uuid();

export const listMedicines = asyncHandler(async (_req, res) => {
  res.json({ medicines: await medicineService.listMedicines() });
});

export const getMedicine = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ medicine: await medicineService.getMedicine(id) });
});

export const createMedicine = asyncHandler(async (req, res) => {
  const input = createMedicineSchema.parse(req.body);
  res.status(201).json({ medicine: await medicineService.createMedicine(input) });
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = updateMedicineSchema.parse(req.body);
  res.json({ medicine: await medicineService.updateMedicine(id, input) });
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  await medicineService.deleteMedicine(id);
  res.status(204).send();
});
