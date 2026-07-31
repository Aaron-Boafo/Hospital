import { Router } from "express";
import { createActivity, listActivities } from "./activity.controller.js";

const activityRouter = Router();

activityRouter.get("/activities", listActivities);
activityRouter.post("/activities", createActivity);

export { activityRouter };
