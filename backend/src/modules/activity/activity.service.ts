import { logger } from "@/shared/logger/index.js";
import type { ActivityLog } from "@/shared/database/schema/types.js";
import { activityRepository } from "./activity.repository.js";
import type { ActivityDto, CreateActivityInput } from "./activity.types.js";

function toDto(log: ActivityLog): ActivityDto {
  return { id: log.id, text: log.text, type: log.type, time: log.time };
}

async function listActivities(): Promise<ActivityDto[]> {
  const logs = await activityRepository.list();
  return logs.map(toDto);
}

async function logActivity(input: CreateActivityInput): Promise<ActivityDto> {
  const log = await activityRepository.create({
    text: input.text,
    type: input.type,
  });
  await activityRepository.pruneToLatest();
  logger.debug("Activity logged", { id: log.id, type: log.type });
  return toDto(log);
}

export const activityService = { listActivities, logActivity };
