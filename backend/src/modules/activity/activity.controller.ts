import { asyncHandler } from "@/shared/utils/index.js";
import { activityService } from "./activity.service.js";
import { createActivitySchema } from "./activity.validation.js";

export const listActivities = asyncHandler(async (_req, res) => {
  res.json({ activities: await activityService.listActivities() });
});

export const createActivity = asyncHandler(async (req, res) => {
  const input = createActivitySchema.parse(req.body);
  res.status(201).json({ activity: await activityService.logActivity(input) });
});
