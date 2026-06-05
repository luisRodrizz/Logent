import { AxiosError } from 'axios'

type ApiErrorResponse = {
  detail?: string
  errors?: string[]
  message?: string
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null && ('message' in value || 'detail' in value || 'errors' in value)
}

export function getApiErrorMessage(error: unknown, fallback = 'No se pudo completar la operacion.'): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 429) {
      return 'Demasiados intentos. Intenta nuevamente en unos minutos.'
    }

    const data = error.response?.data

    if (typeof data === 'string') {
      return data
    }

    if (Array.isArray(data) && data.every((item) => typeof item === 'string')) {
      return data.join(' ')
    }

    if (isApiErrorResponse(data)) {
      const firstError = data.errors?.find((item) => item.trim().length > 0)

      if (data.message && data.message !== 'Validation failed.') {
        return data.message
      }

      return data.detail ?? firstError ?? data.message ?? fallback
    }
  }

  return fallback
}
