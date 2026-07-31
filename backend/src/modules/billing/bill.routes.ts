import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import { createBill, getBill, listBills, recordPayment } from "./bill.controller.js";

const billingRouter = Router();

billingRouter.use(requireRole("ADMIN", "ACCOUNTANT"));

billingRouter.get("/bills", listBills);
billingRouter.get("/bills/:id", getBill);
billingRouter.post("/bills", createBill);
billingRouter.post("/bills/:id/payments", recordPayment);

export { billingRouter };
