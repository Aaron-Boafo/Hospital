import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { doctorService } from "./doctor.service.js";
import { createDoctorSchema, updateDoctorSchema } from "./doctor.validation.js";

const uuidParam = z.uuid();

export const listDoctors = asyncHandler(async (req, res) => {
  const activeOnly = req.query.activeOnly === "1" || req.query.activeOnly === "true";
  res.json({ doctors: await doctorService.listDoctors(activeOnly) });
});

export const getDoctor = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ doctor: await doctorService.getDoctor(id) });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const input = createDoctorSchema.parse(req.body);
  res.status(201).json({ doctor: await doctorService.createDoctor(input) });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = updateDoctorSchema.parse(req.body);
  res.json({ doctor: await doctorService.updateDoctor(id, input) });
});

export const toggleDoctorActive = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ doctor: await doctorService.toggleDoctorActive(id) });
});
