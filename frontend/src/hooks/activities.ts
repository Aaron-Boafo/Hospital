import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createActivity, fetchActivities } from '../services/activities'
import { queryKeys } from '../services/queryKeys'
import type { Activity, ActivityInput, QueryParams } from '../services/types'

export function useActivities(params?: QueryParams) {
  return useQuery<Activity[], Error>({
    queryKey: queryKeys.activities.all(),
    queryFn: () => fetchActivities(params),
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation<Activity, Error, ActivityInput>({
    mutationFn: createActivity,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.activities.all() }),
  })
}
