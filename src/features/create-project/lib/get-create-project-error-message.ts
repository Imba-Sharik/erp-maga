import axios from 'axios'

import type { ResponseErrorConfig } from '@/shared/api'

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

export function getCreateProjectErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const fromBody = messageFromPayload(error.response?.data)
    if (fromBody) return fromBody
    if (error.response?.status === 403) return 'Нет прав на создание проекта'
    if (error.response?.status === 401) return 'Требуется авторизация'
    return 'Не удалось создать проект'
  }

  if (error && typeof error === 'object' && 'error' in error && 'status' in error) {
    const config = error as ResponseErrorConfig<unknown>
    const fromBody = messageFromPayload(config.error)
    if (fromBody) return fromBody
    if (config.status === 403) return 'Нет прав на создание проекта'
    if (config.status === 401) return 'Требуется авторизация'
  }

  return 'Не удалось создать проект'
}
