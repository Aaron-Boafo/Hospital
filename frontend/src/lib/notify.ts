import { toast } from 'sonner'
import { ApiError } from '../api'

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.issues && err.issues.length > 0) {
      return err.issues.map((issue) => issue.message).join(' • ')
    }
    return err.message || 'Request failed'
  }
  if (err instanceof Error) return err.message || 'Something went wrong'
  return 'Something went wrong'
}

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string | unknown) =>
    toast.error(typeof message === 'string' ? message : errorMessage(message)),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
  loading: (message: string) => toast.loading(message),
  retry: (message: string, onRetry: () => void) =>
    toast.error(message, {
      action: { label: 'Retry', onClick: () => onRetry() },
    }),
  promise: (
    promise: Promise<unknown>,
    messages: { loading: string; success: string; error?: string | ((err: unknown) => string) },
  ) => {
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) =>
        typeof messages.error === 'function'
          ? messages.error(err)
          : messages.error ?? errorMessage(err),
    })
    return promise.then(() => true).catch(() => false)
  },
}
