import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fromManagerDirectory } from '../lib/from-manager-directory'
import { managersDirectoryQueryOptions } from '../lib/managers-directory-query'
import { managersToSelectOptions } from '../lib/managers-to-select-options'

export function useManagersDirectory() {
  const query = useQuery(managersDirectoryQueryOptions())

  const managers = useMemo(() => (query.data ?? []).map(fromManagerDirectory), [query.data])

  const selectOptions = useMemo(() => managersToSelectOptions(managers), [managers])

  const filterOptions = useMemo(
    () => selectOptions.map((o) => ({ value: o.id, label: o.fullName })),
    [selectOptions],
  )

  return {
    managers,
    selectOptions,
    filterOptions,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
