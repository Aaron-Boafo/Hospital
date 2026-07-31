import { ServerError } from "@/shared/errors/index.js";
import { logger } from "@/shared/logger/index.js";
import { omitUndefined } from "@/shared/utils/index.js";
import { activityService } from "@/modules/activity/index.js";
import { medicineRepository } from "@/modules/medicine/medicine.repository.js";
import { patientRepository } from "@/modules/patient/patient.repository.js";
import { prescriptionRepository } from "./prescription.repository.js";
import type {
  CreatePrescriptionInput,
  PrescriptionDto,
} from "./prescription.types.js";

type PrescriptionRow = NonNullable<
  Awaited<ReturnType<typeof prescriptionRepository.findById>>
>;

const money = (value: string): number => Number(value);

function toDto(row: PrescriptionRow): PrescriptionDto {
  return {
    id: row.id,
    patient: { id: row.patient!.id, name: row.patient!.name },
    doctorName: row.doctorName,
    date: row.date,
    status: row.status,
    items: row.items.map((item) => ({
      id: item.id,
      medicine: { id: item.medicine!.id, name: item.medicine!.name },
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      quantity: item.quantity,
      dispensed: item.dispensed,
      total: money(item.total),
    })),
    createdAt: row.createdAt,
  };
}

async function getPrescription(id: string): Promise<PrescriptionDto> {
  const row = await prescriptionRepository.findById(id);
  if (!row) throw new ServerError("Prescription not found", 404);
  return toDto(row);
}

async function listPrescriptions(filters: {
  patientId?: string;
}): Promise<PrescriptionDto[]> {
  const rows = await prescriptionRepository.findMany(filters);
  return rows.map(toDto);
}

async function createPrescription(
  input: CreatePrescriptionInput,
): Promise<PrescriptionDto> {
  const patient = await patientRepository.findById(input.patientId);
  if (!patient) throw new ServerError("Patient not found", 404);

  const resolvedItems: {
    medicineId: string;
    dosage: string;
    quantity: number;
    frequency?: string | undefined;
    duration?: string | undefined;
    total: string;
  }[] = [];

  for (const item of input.items) {
    const medicine = await medicineRepository.findById(item.medicineId);
    if (!medicine) {
      throw new ServerError("Medicine not found", 404);
    }
    resolvedItems.push({
      medicineId: item.medicineId,
      dosage: item.dosage,
      quantity: item.quantity,
      frequency: item.frequency,
      duration: item.duration,
      total: (Number(medicine.unitPrice) * item.quantity).toFixed(2),
    });
  }

  const prescriptionId = await prescriptionRepository.createWithItems({
    patientId: input.patientId,
    doctorName: input.doctorName,
    items: resolvedItems,
  });
  logger.info("Prescription created", { prescriptionId });
  return getPrescription(prescriptionId);
}

async function dispensePrescription(id: string): Promise<PrescriptionDto> {
  const prescription = await prescriptionRepository.findById(id);
  if (!prescription) throw new ServerError("Prescription not found", 404);
  if (prescription.status !== "PENDING") {
    throw new ServerError(
      `Only pending prescriptions can be dispensed (current: ${prescription.status})`,
      409,
    );
  }

  const itemUpdates: { id: string; dispensed: "DISPENSED" | "PARTIAL" }[] = [];
  const stockChanges: { medicineId: string; newQuantity: number }[] = [];
  const billItems: { description: string; amount: string }[] = [];
  let billTotal = 0;
  let allDispensed = true;

  for (const item of prescription.items) {
    const medicine = await medicineRepository.findById(item.medicineId);
    if (!medicine) {
      throw new ServerError(
        `Medicine for item ${item.id} no longer exists`,
        400,
      );
    }

    const available = medicine.quantity;
    const dispensedQty = Math.min(item.quantity, available);
    const fullyDispensed = dispensedQty >= item.quantity;
    if (!fullyDispensed) allDispensed = false;

    itemUpdates.push({
      id: item.id,
      dispensed: fullyDispensed ? "DISPENSED" : "PARTIAL",
    });
    stockChanges.push({
      medicineId: item.medicineId,
      newQuantity: available - dispensedQty,
    });

    if (dispensedQty > 0) {
      const amount = Number(medicine.unitPrice) * dispensedQty;
      billTotal += amount;
      billItems.push({
        description: `${medicine.name} x${dispensedQty} (${item.dosage})`,
        amount: amount.toFixed(2),
      });
    }
  }

  const status = allDispensed ? "DISPENSED" : "PARTIAL";

  await prescriptionRepository.applyDispense({
    prescriptionId: id,
    status,
    itemUpdates,
    stockChanges,
    bill: billItems.length > 0
      ? { patientId: prescription.patientId, total: billTotal.toFixed(2) }
      : undefined,
    billItems,
  });

  logger.info("Prescription dispensed", {
    prescriptionId: id,
    status,
    billCreated: billItems.length > 0,
  });
  await activityService.logActivity({
    text:
      billItems.length > 0
        ? "Prescription dispensed — bill created"
        : "Prescription partially dispensed (insufficient stock)",
    type: status === "DISPENSED" ? "SUCCESS" : "WARNING",
  });

  return getPrescription(id);
}

export const prescriptionService = {
  listPrescriptions,
  getPrescription,
  createPrescription,
  dispensePrescription,
};
