export interface User {
  id: string
  name: string
  email: string | null
  role: string
  active: boolean
  createdAt: string
}
