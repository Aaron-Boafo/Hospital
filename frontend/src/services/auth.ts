import { request, setAuthToken } from '../api'
import type { User } from './types'

export async function login(idToken: string): Promise<User> {
  const { token, user } = await request.post<{ token: string; user: User }>('/auth/login', {
    idToken,
  })
  setAuthToken(token)
  return user
}

export async function fetchMe(): Promise<User> {
  const { user } = await request.get<{ user: User }>('/auth/me')
  return user
}

export function logout(): void {
  setAuthToken(null)
}
