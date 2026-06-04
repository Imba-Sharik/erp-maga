import axios from 'axios'

import type { ResponseErrorConfig } from '@/shared/api/client'
import type { AssignmentConflictError } from '@/shared/api/generated/types/AssignmentConflictError'

const ASSIGNMENT_CONFLICT_FALLBACK = 'Эта привязка уже назначена другому менеджеру'

function isAssignmentConflictError(payload: unknown): payload is AssignmentConflictError {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'code' in payload &&
    (payload as AssignmentConflictError).code === 'assignment_conflict'
  )
}

function loftNamesFromIds(
  invalidLoftIds: readonly number[],
  loftIdToName: ReadonlyMap<number, string>,
): string[] {
  return invalidLoftIds
    .map((id) => loftIdToName.get(id))
    .filter((name): name is string => Boolean(name))
}

export function getAssignmentConflictErrorMessage(
  error: unknown,
  loftIdToName?: ReadonlyMap<number, string>,
): string {
  const resolvePayload = (payload: unknown): string | null => {
    if (!isAssignmentConflictError(payload)) {
      if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
        const detail = (payload as { detail: unknown }).detail
        if (typeof detail === 'string' && detail.length > 0) return detail
      }
      return null
    }

    if (payload.detail.length > 0) {
      const names =
        loftIdToName && payload.invalid_loft_ids.length > 0
          ? loftNamesFromIds(payload.invalid_loft_ids, loftIdToName)
          : []
      if (names.length > 0 && !payload.detail.includes(names[0]!)) {
        return `${payload.detail} (${names.join(', ')})`
      }
      return payload.detail
    }

    if (payload.invalid_loft_ids.length > 0 && loftIdToName) {
      const names = loftNamesFromIds(payload.invalid_loft_ids, loftIdToName)
      if (names.length > 0) {
        return `${ASSIGNMENT_CONFLICT_FALLBACK}: ${names.join(', ')}`
      }
    }

    return ASSIGNMENT_CONFLICT_FALLBACK
  }

  if (axios.isAxiosError(error)) {
    const fromBody = resolvePayload(error.response?.data)
    if (fromBody) return fromBody
    if (error.response?.status === 400) return ASSIGNMENT_CONFLICT_FALLBACK
    if (error.response?.status === 403) return 'Нет прав на изменение привязок'
    if (error.response?.status === 401) return 'Требуется авторизация'
    return 'Не удалось сохранить привязки'
  }

  if (error && typeof error === 'object' && 'error' in error && 'status' in error) {
    const config = error as ResponseErrorConfig<unknown>
    const fromBody = resolvePayload(config.error)
    if (fromBody) return fromBody
    if (config.status === 400) return ASSIGNMENT_CONFLICT_FALLBACK
    if (config.status === 403) return 'Нет прав на изменение привязок'
    if (config.status === 401) return 'Требуется авторизация'
  }

  return 'Не удалось сохранить привязки'
}
