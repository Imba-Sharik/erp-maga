import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fromManagerDirectory } from '../lib/from-manager-directory'
import { managersDirectoryQueryOptions } from '../lib/managers-directory-query'
import {
  isManagersDirectoryOptionsLoading,
  shouldShowManagerHallAssignmentHint,
} from '../lib/manager-hall-assignment-hint'
import { managersToSelectOptions } from '../lib/managers-to-select-options'
import type { ManagersDirectoryFilter } from './managers-directory-filter'

export interface UseManagersDirectoryOptions {
  enabled?: boolean
}

export function useManagersDirectory(
  filter?: ManagersDirectoryFilter,
  { enabled = true }: UseManagersDirectoryOptions = {},
) {
  const query = useQuery({
    ...managersDirectoryQueryOptions(filter),
    enabled,
  })

  const filtered = filter !== undefined

  const managers = useMemo(() => (query.data ?? []).map(fromManagerDirectory), [query.data])

  const selectOptions = useMemo(() => managersToSelectOptions(managers), [managers])

  const filterOptions = useMemo(
    () => selectOptions.map((o) => ({ value: o.id, label: o.fullName })),
    [selectOptions],
  )

  const queryState = {
    filtered,
    isFetched: query.isFetched,
    isFetching: query.isFetching,
    isError: query.isError,
  }

  const isOptionsLoading = isManagersDirectoryOptionsLoading(queryState)
  const showHallAssignmentHint = shouldShowManagerHallAssignmentHint({
    ...queryState,
    options: selectOptions,
  })

  return {
    managers,
    selectOptions,
    filterOptions,
    isLoading: query.isPending,
    isOptionsLoading,
    showHallAssignmentHint,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
