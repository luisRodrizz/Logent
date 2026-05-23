import { AxiosError } from 'axios'

type ApiErrorResponse = {
  detail?: string
  message?: string
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null && ('message' in value || 'detail' in value)
}

export function getApiErrorMessage(error: unknown, fallback = 'No se pudo completar la operacion.'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data

    if (typeof data === 'string') {
      return data
    }

    if (Array.isArray(data) && data.every((item) => typeof item === 'string')) {
      return data.join(' ')
    }

    if (isApiErrorResponse(data)) {
      return data.message ?? data.detail ?? fallback
    }
  }

  return fallback
}
