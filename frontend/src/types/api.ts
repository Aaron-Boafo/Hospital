declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export interface ApiIssue {
  path: string
  message: string
}
