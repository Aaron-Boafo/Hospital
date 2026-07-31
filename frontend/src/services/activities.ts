import { request } from '../api'

export const ACTIVITY_TYPES = ['ACCENT', 'INFO', 'SUCCESS', 'WARNING', 'DANGER'] as const
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

export async function fetchActivities(): Promise<ActivityDto[]> {
  const { activities } = await request.get<{ activities: ActivityDto[] }>('/activities')
  return activities
}

export async function createActivity(input: CreateActivityInput): Promise<ActivityDto> {
  const { activity } = await request.post<{ activity: ActivityDto }>('/activities', input)
  return activity
}
