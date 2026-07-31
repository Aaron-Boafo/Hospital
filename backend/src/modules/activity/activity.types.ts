import type { ActivityType } from "./activity.constants.js";

export interface ActivityDto {
  id: string;
  text: string;
  type: ActivityType;
  time: Date;
}

export interface CreateActivityInput {
  text: string;
  type: ActivityType;
}
