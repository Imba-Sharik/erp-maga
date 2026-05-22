import { managersDirectoryListQueryOptions } from '@/shared/api/generated/hooks/usersController/useManagersDirectoryList'

/** Метрики менеджеров меняются при работе с проектами — обновляем при фокусе вкладки. */
export const MANAGERS_DIRECTORY_STALE_TIME = 60_000

const managersDirectoryOverrides = {
  staleTime: MANAGERS_DIRECTORY_STALE_TIME,
} as const

export function managersDirectoryQueryOptions() {
  return {
    ...managersDirectoryListQueryOptions(),
    ...managersDirectoryOverrides,
  }
}

export { managersDirectoryListQueryKey } from '@/shared/api/generated/hooks/usersController/useManagersDirectoryList'
