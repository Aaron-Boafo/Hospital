import type { MedicineCategory } from "./medicine.constants.js";

export interface MedicineDto {
  id: string;
  name: string;
  category: MedicineCategory;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  expiryDate: string | null;
  supplier: string | null;
  createdAt: Date;
  isLowStock: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export interface CreateMedicineInput {
  name: string;
  category: MedicineCategory;
  unitPrice: number;
  quantity: number;
  reorderLevel?: number | undefined;
  expiryDate?: string | undefined;
  supplier?: string | undefined;
}

export type UpdateMedicineInput = {
  name?: string | undefined;
  category?: MedicineCategory | undefined;
  unitPrice?: number | undefined;
  quantity?: number | undefined;
  reorderLevel?: number | undefined;
  expiryDate?: string | undefined;
  supplier?: string | undefined;
};
