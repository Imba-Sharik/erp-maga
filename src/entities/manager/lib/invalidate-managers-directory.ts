import type { QueryClient } from '@tanstack/react-query'

import { managersDirectoryListQueryKey } from './managers-directory-query'

export function invalidateManagersDirectory(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: managersDirectoryListQueryKey() })
}
