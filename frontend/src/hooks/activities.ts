import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import { createActivity, fetchActivities } from '../services/activities'
import type { CreateActivityInput } from '../types'

export function useActivities() {
  return useQuery({
    queryKey: queryKeys.activities.all,
    queryFn: fetchActivities,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all })
    },
  })
}
