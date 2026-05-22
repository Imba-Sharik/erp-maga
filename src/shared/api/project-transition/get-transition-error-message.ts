import axios from 'axios'

import type { ResponseErrorConfig } from '@/shared/api/client'

function messageFromPayload(payload: unknown): string | null {
  if (typeof payload === 'object' && payload !== null) {
    if ('detail' in payload && typeof payload.detail === 'string') {
      return payload.detail
    }
    const firstFieldMessage = Object.values(payload).find(
      (value) =>
        typeof value === 'string' || (Array.isArray(value) && typeof value[0] === 'string'),
    )
    if (typeof firstFieldMessage === 'string') return firstFieldMessage
    if (Array.isArray(firstFieldMessage) && typeof firstFieldMessage[0] === 'string') {
      return firstFieldMessage[0]
    }
  }
  return null
}

export function getTransitionErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const fromBody = messageFromPayload(error.response?.data)
    if (fromBody) return fromBody
    if (error.response?.status === 403) return 'Нет прав на выполнение операции'
    if (error.response?.status === 401) return 'Требуется авторизация'
    if (error.response?.status === 400) return 'Некорректные данные перехода'
    return fallback
  }

  if (error && typeof error === 'object' && 'error' in error && 'status' in error) {
    const config = error as ResponseErrorConfig<unknown>
    const fromBody = messageFromPayload(config.error)
    if (fromBody) return fromBody
    if (config.status === 403) return 'Нет прав на выполнение операции'
    if (config.status === 401) return 'Требуется авторизация'
    if (config.status === 400) return 'Некорректные данные перехода'
  }

  return fallback
}
