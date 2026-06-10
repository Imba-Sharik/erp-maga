import axios from 'axios'

import type { ResponseErrorConfig } from '@/shared/api/client'

const SAVE_FALLBACK = 'Не удалось сохранить привязки'

function detailFromPayload(payload: unknown): string | null {
  if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
    const detail = (payload as { detail: unknown }).detail
    if (typeof detail === 'string' && detail.length > 0) return detail
  }
  return null
}

export function getAssignmentErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const fromBody = detailFromPayload(error.response?.data)
    if (fromBody) return fromBody
    if (error.response?.status === 403) return 'Нет прав на изменение привязок'
    if (error.response?.status === 401) return 'Требуется авторизация'
    return SAVE_FALLBACK
  }

  if (error && typeof error === 'object' && 'error' in error && 'status' in error) {
    const config = error as ResponseErrorConfig<unknown>
    const fromBody = detailFromPayload(config.error)
    if (fromBody) return fromBody
    if (config.status === 403) return 'Нет прав на изменение привязок'
    if (config.status === 401) return 'Требуется авторизация'
  }

  return SAVE_FALLBACK
}
