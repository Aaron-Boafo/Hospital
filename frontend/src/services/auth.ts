import { request } from '../api'
import type { User } from '../types'

export async function login(idToken: string): Promise<User> {
  const { user } = await request.post<{ user: User }>('/auth/login', { idToken })
  return user
}

export async function logout(): Promise<void> {
  await request.post('/auth/logout')
}
