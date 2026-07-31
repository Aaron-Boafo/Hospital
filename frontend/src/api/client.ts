import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const SESSION_KEY = 'hms_user'

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
  withCredentials: true,
})

let refreshPromise: Promise<boolean> | null = null

async function exchangeIdToken(): Promise<boolean> {
  try {
    const { auth } = await import('../config/firebase')
    const firebaseUser = auth?.currentUser
    if (!firebaseUser) return false
    const idToken = await firebaseUser.getIdToken(true)
    await instance.post('/auth/login', { idToken })
    return true
  } catch {
    return false
  }
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  void instance.post('/auth/logout').catch(() => undefined)
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
        const refreshed = await refreshPromise
        if (refreshed) {
          config._retry = true
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
