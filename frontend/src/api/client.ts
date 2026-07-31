import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const TOKEN_KEY = 'hms_token'
const SESSION_KEY = 'hms_user'

export interface ApiIssue {
  path: string
  message: string
}

export class ApiError extends Error {
  status?: number
  issues?: ApiIssue[]

  constructor(message: string, status?: number, issues?: ApiIssue[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1000/api',
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function exchangeIdToken(): Promise<string | null> {
  try {
    const { auth } = await import('../config/firebase')
    const firebaseUser = auth?.currentUser
    if (!firebaseUser) return null
    const idToken = await firebaseUser.getIdToken(true)
    const { data } = await instance.post<{ token: string }>('/auth/login', { idToken })
    setAuthToken(data.token)
    return data.token
  } catch {
    return null
  }
}

function clearSession(): void {
  setAuthToken(null)
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status: number | undefined = error.response?.status
    const config: InternalAxiosRequestConfig | undefined = error.config
    const isAuthEndpoint = typeof config?.url === 'string' && config.url.includes('/auth/login')

    if (status === 401 && config && !isAuthEndpoint && !config._retry) {
      try {
        refreshPromise ??= exchangeIdToken()
        const newToken = await refreshPromise
        if (newToken) {
          config._retry = true
          config.headers.Authorization = `Bearer ${newToken}`
          return instance(config)
        }
      } finally {
        refreshPromise = null
      }
      clearSession()
      return Promise.reject(new ApiError('Session expired — please sign in again', 401))
    }

    const data = error.response?.data
    const message: string = data?.message || error.message || 'Request failed'
    const issues: ApiIssue[] | undefined = data?.issues
    return Promise.reject(new ApiError(message, status, issues))
  },
)

export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.get<T>(url, config).then((response) => response.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    instance.post<T>(url, data, config).then((response) => response.data),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    instance.put<T>(url, data, config).then((response) => response.data),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    instance.patch<T>(url, data, config).then((response) => response.data),
  delete: <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.delete<T>(url, config).then((response) => response.data),
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}
