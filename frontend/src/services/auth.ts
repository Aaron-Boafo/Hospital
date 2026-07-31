import { request } from '../api'

export interface User {
  id: string
  name: string
  email: string | null
  role: string
  active: boolean
  createdAt: string
}

export async function login(idToken: string): Promise<User> {
  const { user } = await request.post<{ user: User }>('/auth/login', { idToken })
  return user
}

export async function logout(): Promise<void> {
  await request.post('/auth/logout')
}
