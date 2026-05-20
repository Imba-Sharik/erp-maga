import { useMemo } from 'react'

import type { Project } from '@/entities/project'
import { env } from '@/shared/config/env'

import { CLOSING_ARCHIVE_MOCK_PROJECTS } from '../model/closing-archive-mock-projects'

/** Всегда включены моки, пока бэкенд не поддерживает stage=archived. */
const isArchiveMocksEnabled = import.meta.env.DEV || env.USE_MOCKS

export interface UseClosingArchiveQueryResult {
  projects: Project[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function useClosingArchiveQuery(): UseClosingArchiveQueryResult {
  const projects = useMemo(() => (isArchiveMocksEnabled ? CLOSING_ARCHIVE_MOCK_PROJECTS : []), [])

  return {
    projects,
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => {},
  }
}
