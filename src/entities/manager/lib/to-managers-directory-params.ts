import type { ManagersDirectoryListQueryParams } from '@/shared/api/generated/types/usersController/ManagersDirectoryList'

import type { ManagersDirectoryFilter } from '../model/managers-directory-filter'

export function toManagersDirectoryParams(
  filter?: ManagersDirectoryFilter,
): ManagersDirectoryListQueryParams | undefined {
  if (!filter) return undefined

  if ('projectId' in filter && Number.isFinite(filter.projectId)) {
    return { project_id: filter.projectId }
  }

  if ('hallId' in filter && Number.isFinite(filter.hallId)) {
    return {
      hall_id: filter.hallId,
      ...(filter.loftId != null && Number.isFinite(filter.loftId)
        ? { loft_id: filter.loftId }
        : {}),
    }
  }

  return undefined
}
