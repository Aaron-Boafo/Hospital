import { ACTIVITY_TYPES } from '../constants/activities'

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export interface ActivityDto {
  id: string
  text: string
  type: ActivityType
  time: string
}

export interface CreateActivityInput {
  text: string
  type: ActivityType
}
