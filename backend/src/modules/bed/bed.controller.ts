import { z } from "zod";
import { asyncHandler } from "@/shared/utils/index.js";
import { ServerError } from "@/shared/errors/index.js";
import { bedService } from "./bed.service.js";
import {
  admitSchema,
  createBedSchema,
  createWardSchema,
  updateBedSchema,
  updateWardSchema,
} from "./bed.validation.js";

const uuidParam = z.uuid();

export const listWards = asyncHandler(async (_req, res) => {
  res.json({ wards: await bedService.listWards() });
});

export const getWard = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ ward: await bedService.getWard(id) });
});

export const createWard = asyncHandler(async (req, res) => {
  const input = createWardSchema.parse(req.body);
  res.status(201).json({ ward: await bedService.createWard(input) });
});

export const updateWard = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = updateWardSchema.parse(req.body);
  res.json({ ward: await bedService.updateWard(id, input) });
});

export const deleteWard = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  await bedService.deleteWard(id);
  res.status(204).end();
});

export const listBeds = asyncHandler(async (_req, res) => {
  res.json({ beds: await bedService.listBeds() });
});

export const getBed = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({ bed: await bedService.getBed(id) });
});

export const createBed = asyncHandler(async (req, res) => {
  const input = createBedSchema.parse(req.body);
  res.status(201).json({ bed: await bedService.createBed(input) });
});

export const updateBed = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = updateBedSchema.parse(req.body);
  res.json({ bed: await bedService.updateBed(id, input) });
});

export const deleteBed = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  await bedService.deleteBed(id);
  res.status(204).end();
});

export const admitToBed = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  const input = admitSchema.parse(req.body);
  if (!req.user) throw new ServerError("Unauthorized", 401);
  res.status(201).json({
    assignment: await bedService.admitToBed(id, input, req.user.id),
  });
});

export const dischargeFromBed = asyncHandler(async (req, res) => {
  const id = uuidParam.parse(req.params.id);
  res.json({
    assignment: await bedService.dischargeFromBed(id),
  });
});

export const listAssignments = asyncHandler(async (_req, res) => {
  res.json({ assignments: await bedService.listAssignments() });
});
