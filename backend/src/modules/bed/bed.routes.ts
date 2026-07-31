import { Router } from "express";
import { requireRole } from "@/shared/middleware/auth.js";
import {
  admitToBed,
  createBed,
  createWard,
  deleteBed,
  deleteWard,
  dischargeFromBed,
  getBed,
  getWard,
  listAssignments,
  listBeds,
  listWards,
  updateBed,
  updateWard,
} from "./bed.controller.js";

const bedRouter = Router();

bedRouter.use(requireRole("ADMIN", "DOCTOR", "RECEPTIONIST"));

bedRouter.get("/wards", listWards);
bedRouter.get("/wards/:id", getWard);
bedRouter.post("/wards", createWard);
bedRouter.put("/wards/:id", updateWard);
bedRouter.delete("/wards/:id", deleteWard);

bedRouter.get("/beds", listBeds);
bedRouter.get("/beds/:id", getBed);
bedRouter.post("/beds", createBed);
bedRouter.put("/beds/:id", updateBed);
bedRouter.delete("/beds/:id", deleteBed);
bedRouter.post("/beds/:id/admit", admitToBed);
bedRouter.post("/beds/:id/discharge", dischargeFromBed);

bedRouter.get("/bed-assignments", listAssignments);

export { bedRouter };
