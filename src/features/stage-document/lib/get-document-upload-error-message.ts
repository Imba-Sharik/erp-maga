import axios from 'axios'

import type { ResponseErrorConfig } from '@/shared/api'

/** Поля DRF в порядке релевантности для загрузки файла. */
const PREFERRED_ERROR_FIELDS = ['detail', 'file', 'non_field_errors'] as const

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

function messageFromPayload(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null
  const record = payload as Record<string, unknown>

  for (const field of PREFERRED_ERROR_FIELDS) {
    const message = asString(record[field])
    if (message) return message
  }

  for (const value of Object.values(record)) {
    const message = asString(value)
    if (message) return message
  }
  return null
}

export function getDocumentUploadErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const fromBody = messageFromPayload(error.response?.data)
    if (fromBody) return fromBody
    if (error.response?.status === 403) return 'Нет прав на загрузку документа'
    if (error.response?.status === 401) return 'Требуется авторизация'
    if (error.response?.status === 400) return 'Не удалось загрузить файл'
    return 'Не удалось загрузить файл'
  }

  if (error && typeof error === 'object' && 'error' in error && 'status' in error) {
    const config = error as ResponseErrorConfig<unknown>
    const fromBody = messageFromPayload(config.error)
    if (fromBody) return fromBody
    if (config.status === 403) return 'Нет прав на загрузку документа'
    if (config.status === 401) return 'Требуется авторизация'
    if (config.status === 400) return 'Не удалось загрузить файл'
  }

  return 'Не удалось загрузить файл'
}
