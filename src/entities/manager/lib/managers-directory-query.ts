import { managersDirectoryListQueryOptions } from '@/shared/api/generated/hooks/usersController/useManagersDirectoryList'
import type { ManagersDirectoryListQueryParams } from '@/shared/api/generated/types/usersController/ManagersDirectoryList'

import { toManagersDirectoryParams } from './to-managers-directory-params'
import type { ManagersDirectoryFilter } from '../model/managers-directory-filter'

/** Метрики менеджеров меняются при работе с проектами — обновляем при фокусе вкладки. */
export const MANAGERS_DIRECTORY_STALE_TIME = 60_000

const managersDirectoryOverrides = {
  staleTime: MANAGERS_DIRECTORY_STALE_TIME,
} as const

export function managersDirectoryQueryOptions(filter?: ManagersDirectoryFilter) {
  const params: ManagersDirectoryListQueryParams | undefined = toManagersDirectoryParams(filter)

  return {
    ...managersDirectoryListQueryOptions(params),
    ...managersDirectoryOverrides,
  }
}

export { managersDirectoryListQueryKey } from '@/shared/api/generated/hooks/usersController/useManagersDirectoryList'
