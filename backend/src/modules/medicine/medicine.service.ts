import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { omitUndefined } from "@/shared/utils/index.js";
import type { Medicine } from "@/shared/database/schema/types.js";
import { activityService } from "@/modules/activity/index.js";
import { medicineRepository } from "./medicine.repository.js";
import type {
  CreateMedicineInput,
  MedicineDto,
  UpdateMedicineInput,
} from "./medicine.types.js";

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function toDto(medicine: Medicine): MedicineDto {
  const today = todayString();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const soonString = in30Days.toISOString().slice(0, 10);

  const isExpired = medicine.expiryDate !== null && medicine.expiryDate < today;
  const isExpiringSoon =
    medicine.expiryDate !== null &&
    !isExpired &&
    medicine.expiryDate <= soonString;

  return {
    id: medicine.id,
    name: medicine.name,
    category: medicine.category,
    unitPrice: Number(medicine.unitPrice),
    quantity: medicine.quantity,
    reorderLevel: medicine.reorderLevel,
    expiryDate: medicine.expiryDate,
    supplier: medicine.supplier,
    createdAt: medicine.createdAt,
    isLowStock:
      medicine.reorderLevel > 0 && medicine.quantity <= medicine.reorderLevel,
    isExpired,
    isExpiringSoon,
  };
}

async function listMedicines(): Promise<MedicineDto[]> {
  const rows = await medicineRepository.findMany();
  return rows.map(toDto);
}

async function getMedicine(id: string): Promise<MedicineDto> {
  const row = await medicineRepository.findById(id);
  if (!row) throw new ServerError("Medicine not found", 404);
  return toDto(row);
}

async function createMedicine(input: CreateMedicineInput): Promise<MedicineDto> {
  const row = await medicineRepository.create(
    omitUndefined({
      ...input,
      unitPrice: String(input.unitPrice),
      reorderLevel: input.reorderLevel ?? 0,
    }),
  );
  logger.info("Medicine created", { medicineId: row.id });
  await activityService.logActivity({
    text: `Medicine ${row.name} added`,
    type: "SUCCESS",
  });
  return toDto(row);
}

async function updateMedicine(id: string, input: UpdateMedicineInput): Promise<MedicineDto> {
  const existing = await medicineRepository.findById(id);
  if (!existing) throw new ServerError("Medicine not found", 404);
  const updated = await medicineRepository.update(id, omitUndefined({ ...input }));
  return toDto(updated!);
}

async function deleteMedicine(id: string): Promise<void> {
  const existing = await medicineRepository.findById(id);
  if (!existing) throw new ServerError("Medicine not found", 404);
  try {
    await medicineRepository.remove(id);
  } catch (error) {
    if ((error as { code?: string }).code === "23503") {
      throw new ServerError(
        "Medicine is referenced by prescriptions and cannot be deleted",
        409,
      );
    }
    throw error;
  }
  await activityService.logActivity({
    text: `Medicine ${existing.name} deleted`,
    type: "WARNING",
  });
}

export const medicineService = {
  listMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
