import { request } from '../api'
import type { ActivityDto, CreateActivityInput } from '../types'

export async function fetchActivities(): Promise<ActivityDto[]> {
  const { activities } = await request.get<{ activities: ActivityDto[] }>('/activities')
  return activities
}

export async function createActivity(input: CreateActivityInput): Promise<ActivityDto> {
  const { activity } = await request.post<{ activity: ActivityDto }>('/activities', input)
  return activity
}
