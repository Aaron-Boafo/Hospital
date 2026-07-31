import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { patientService } from "./patient.service.js";
import {
  createPatientSchema,
  updatePatientSchema,
  vitalSignSchema,
  visitRecordSchema,
} from "./patient.validation.js";

const uuidParam = z.uuid();

export const listPatients = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  res.json({ patients: await patientService.listPatients(search) });
});

export const getPatient = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json(await patientService.getPatientDetail(id));
});

export const createPatient = asyncHandler(async (req, res) => {
  const input = createPatientSchema.parse(req.body);
  res.status(201).json({ patient: await patientService.createPatient(input) });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = updatePatientSchema.parse(req.body);
  res.json({ patient: await patientService.updatePatient(id, input) });
});

export const deletePatient = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  await patientService.deletePatient(id);
  res.status(204).send();
});

export const getVitals = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ vitals: await patientService.getPatientVitals(id) });
});

export const addVital = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = vitalSignSchema.parse(req.body);
  res.status(201).json({ vital: await patientService.addPatientVital(id, input) });
});

export const getVisits = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ visits: await patientService.getPatientVisits(id) });
});

export const addVisit = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = visitRecordSchema.parse(req.body);
  res.status(201).json({ visit: await patientService.addPatientVisit(id, input) });
});
