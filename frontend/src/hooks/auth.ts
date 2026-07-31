import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMe, login } from '../services/auth'
import { queryKeys } from '../services/queryKeys'
import type { User } from '../services/types'

export function useMe() {
  return useQuery<User, Error>({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    retry: false,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation<User, Error, string>({
    mutationFn: login,
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.auth.me, user)
    },
  })
}
