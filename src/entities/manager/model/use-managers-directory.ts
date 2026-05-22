import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fromManagerDirectory } from '../lib/from-manager-directory'
import { managersDirectoryQueryOptions } from '../lib/managers-directory-query'

export function useManagersDirectory() {
  const query = useQuery(managersDirectoryQueryOptions())

  const managers = useMemo(() => (query.data ?? []).map(fromManagerDirectory), [query.data])

  return {
    managers,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
