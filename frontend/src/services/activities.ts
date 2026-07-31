import { request } from '../api'
import type { Activity, ActivityInput, QueryParams } from './types'

export async function fetchActivities(params?: QueryParams): Promise<Activity[]> {
  const { activities } = await request.get<{ activities: Activity[] }>('/activities', { params })
  return activities
}

export async function createActivity(payload: ActivityInput): Promise<Activity> {
  const { activity } = await request.post<{ activity: Activity }>('/activities', payload)
  return activity
}
