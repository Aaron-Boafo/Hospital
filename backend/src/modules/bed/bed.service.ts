import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { omitUndefined } from "@/shared/utils/index.js";
import { activityService } from "@/modules/activity/index.js";
import { patientRepository } from "@/modules/patient/patient.repository.js";
import { bedRepository } from "./bed.repository.js";
import type {
  AdmitInput,
  BedAssignmentDto,
  BedDto,
  CreateBedInput,
  CreateWardInput,
  UpdateBedInput,
  UpdateWardInput,
  WardDto,
} from "./bed.types.js";

type BedRow = NonNullable<Awaited<ReturnType<typeof bedRepository.findBedById>>>;
type WardRow = Awaited<ReturnType<typeof bedRepository.findWards>>[number];
type AssignmentRow = NonNullable<
  Awaited<ReturnType<typeof bedRepository.findAssignmentById>>
>;

type WardBase = Pick<WardRow, "id" | "name" | "totalBeds" | "createdAt" | "updatedAt">;

function toWardDto(row: WardBase, beds: number): WardDto {
  return {
    id: row.id,
    name: row.name,
    totalBeds: row.totalBeds,
    beds,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toBedDto(row: BedRow): BedDto {
  const active = row.assignments[0];
  return {
    id: row.id,
    wardId: row.wardId,
    number: row.number,
    bedType: row.bedType,
    status: row.status,
    ward: row.ward,
    patient: active?.patient ?? null,
    admittedAt: active?.admittedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAssignmentDto(row: AssignmentRow): BedAssignmentDto {
  return {
    id: row.id,
    bed: { id: row.bed!.id, number: row.bed!.number, ward: row.bed!.ward! },
    patient: { id: row.patient!.id, name: row.patient!.name },
    assignedBy: row.assignedByUser ?? null,
    admittedAt: row.admittedAt,
    dischargedAt: row.dischargedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listWards(): Promise<WardDto[]> {
  const rows = await bedRepository.findWards();
  return rows.map((row) => toWardDto(row, row.beds?.length ?? 0));
}

async function getWard(id: string): Promise<WardDto> {
  const row = await bedRepository.findWardById(id);
  if (!row) throw new ServerError("Ward not found", 404);
  const beds = (await bedRepository.findWardBedNumbers(id)).length;
  return toWardDto(row, beds);
}

async function createWard(input: CreateWardInput): Promise<WardDto> {
  if (await bedRepository.findWardByName(input.name)) {
    throw new ServerError("A ward with this name already exists", 409);
  }
  const ward = await bedRepository.createWard(input);
  logger.info("Ward created", { wardId: ward.id, totalBeds: input.totalBeds });
  await activityService.logActivity({
    text: `Ward "${ward.name}" created with ${input.totalBeds} beds`,
    type: "SUCCESS",
  });
  return toWardDto(ward, input.totalBeds);
}

async function updateWard(id: string, input: UpdateWardInput): Promise<WardDto> {
  const ward = await bedRepository.findWardById(id);
  if (!ward) throw new ServerError("Ward not found", 404);

  if (input.name !== undefined && input.name !== ward.name) {
    const existing = await bedRepository.findWardByName(input.name);
    if (existing) throw new ServerError("A ward with this name already exists", 409);
    await bedRepository.updateWardName(id, input.name);
  }

  if (
    input.totalBeds !== undefined &&
    input.totalBeds !== ward.totalBeds
  ) {
    const numbers = await bedRepository.findWardBedNumbers(id);
    const current = numbers.length;

    if (input.totalBeds > current) {
      const max = numbers.length > 0 ? Math.max(...numbers) : 0;
      const toAdd = Array.from(
        { length: input.totalBeds - current },
        (_, i) => max + i + 1,
      );
      await bedRepository.addBedsToWard(id, toAdd);
      await bedRepository.updateWardTotal(id, input.totalBeds);
    } else if (input.totalBeds < current) {
      const toRemove = [...numbers].sort((a, b) => b - a).slice(0, current - input.totalBeds);
      for (const number of toRemove) {
        const bed = await bedRepository.findBedByWardAndNumber(id, number);
        if (bed?.assignments.length) {
          throw new ServerError(
            `Cannot shrink ward: bed ${number} is currently occupied`,
            409,
          );
        }
      }
      await bedRepository.removeBedsFromWard(id, toRemove);
      await bedRepository.updateWardTotal(id, input.totalBeds);
    }
  }

  logger.info("Ward updated", { wardId: id });
  return getWard(id);
}

async function deleteWard(id: string): Promise<void> {
  const ward = await bedRepository.findWardById(id);
  if (!ward) throw new ServerError("Ward not found", 404);
  const occupied = await bedRepository.findWardOccupiedCount(id);
  if (occupied > 0) {
    throw new ServerError("Cannot delete a ward with occupied beds", 409);
  }
  await bedRepository.removeWard(id);
  logger.info("Ward deleted", { wardId: id });
  await activityService.logActivity({
    text: `Ward "${ward.name}" deleted`,
    type: "INFO",
  });
}

async function listBeds(): Promise<BedDto[]> {
  const rows = await bedRepository.findBeds();
  return rows.map(toBedDto);
}

async function getBed(id: string): Promise<BedDto> {
  const row = await bedRepository.findBedById(id);
  if (!row) throw new ServerError("Bed not found", 404);
  return toBedDto(row);
}

async function createBed(input: CreateBedInput): Promise<BedDto> {
  const ward = await bedRepository.findWardById(input.wardId);
  if (!ward) throw new ServerError("Ward not found", 404);
  const existing = await bedRepository.findBedByWardAndNumber(
    input.wardId,
    input.number,
  );
  if (existing) {
    throw new ServerError(
      `Bed ${input.number} already exists in ward "${ward.name}"`,
      409,
    );
  }
  const bed = await bedRepository.createBed(input);
  logger.info("Bed created", { bedId: bed.id });
  await activityService.logActivity({
    text: `Bed ${input.number} added to ward "${ward.name}"`,
    type: "SUCCESS",
  });
  return getBed(bed.id);
}

async function updateBed(id: string, input: UpdateBedInput): Promise<BedDto> {
  const bed = await bedRepository.findBedById(id);
  if (!bed) throw new ServerError("Bed not found", 404);

  if (input.number !== undefined && input.number !== bed.number) {
    const existing = await bedRepository.findBedByWardAndNumber(
      bed.wardId,
      input.number,
    );
    if (existing) {
      throw new ServerError(`Bed ${input.number} already exists in this ward`, 409);
    }
  }

  if (input.status !== undefined && bed.assignments.length > 0) {
    throw new ServerError("Cannot change the status of an occupied bed", 409);
  }

  await bedRepository.updateBed(id, omitUndefined({ ...input }));
  logger.info("Bed updated", { bedId: id });
  return getBed(id);
}

async function deleteBed(id: string): Promise<void> {
  const bed = await bedRepository.findBedById(id);
  if (!bed) throw new ServerError("Bed not found", 404);
  if (bed.assignments.length > 0) {
    throw new ServerError("Cannot delete an occupied bed", 409);
  }
  await bedRepository.removeBed(id, bed.wardId);
  logger.info("Bed deleted", { bedId: id });
  await activityService.logActivity({
    text: `Bed ${bed.number} removed from ward "${bed.ward?.name ?? "unknown"}"`,
    type: "INFO",
  });
}

async function admitToBed(
  bedId: string,
  input: AdmitInput,
  userId: string,
): Promise<BedAssignmentDto> {
  const bed = await bedRepository.findBedById(bedId);
  if (!bed) throw new ServerError("Bed not found", 404);
  if (bed.assignments.length > 0) {
    throw new ServerError("This bed is already occupied", 409);
  }
  if (bed.status !== "AVAILABLE") {
    throw new ServerError(
      `This bed is not available (current status: ${bed.status})`,
      409,
    );
  }

  const patient = await patientRepository.findById(input.patientId);
  if (!patient) throw new ServerError("Patient not found", 404);
  const active = await bedRepository.findActiveAssignmentByPatient(input.patientId);
  if (active) {
    throw new ServerError("This patient is already assigned to a bed", 409);
  }

  const assignment = await bedRepository.admit({
    bedId,
    patientId: input.patientId,
    assignedBy: userId,
  });
  logger.info("Patient admitted to bed", {
    bedId,
    patientId: input.patientId,
  });
  await activityService.logActivity({
    text: `${patient.name} admitted to ward "${bed.ward?.name ?? ""}" bed ${bed.number}`,
    type: "SUCCESS",
  });

  const row = await bedRepository.findAssignmentById(assignment.id);
  return toAssignmentDto(row!);
}

async function dischargeFromBed(bedId: string): Promise<BedAssignmentDto> {
  const bed = await bedRepository.findBedById(bedId);
  if (!bed) throw new ServerError("Bed not found", 404);
  const active = await bedRepository.findActiveAssignmentByBed(bedId);
  if (!active) {
    throw new ServerError("No active admission for this bed", 409);
  }

  const row = await bedRepository.findAssignmentById(active.id);
  await bedRepository.discharge(active.id, bedId);
  logger.info("Patient discharged from bed", { bedId, assignmentId: active.id });
  await activityService.logActivity({
    text: `${row?.patient?.name ?? "Patient"} discharged from ward "${bed.ward?.name ?? ""}" bed ${bed.number}`,
    type: "INFO",
  });

  const updated = await bedRepository.findAssignmentById(active.id);
  return toAssignmentDto(updated!);
}

async function listAssignments(): Promise<BedAssignmentDto[]> {
  const rows = await bedRepository.findAssignments();
  return rows.map(toAssignmentDto);
}

export const bedService = {
  listWards,
  getWard,
  createWard,
  updateWard,
  deleteWard,
  listBeds,
  getBed,
  createBed,
  updateBed,
  deleteBed,
  admitToBed,
  dischargeFromBed,
  listAssignments,
};
