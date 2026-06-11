import { useMemo, useState } from 'react'

import { OUTSIDE_MAG_BACK_ORIGIN, type Project } from '@/entities/project'
import { resolveManagerFilterName, useManagersDirectory } from '@/entities/manager'
import { resolveVenueFilterIds, useVenueCatalog } from '@/entities/venue'
import { ReturnProjectFromOutsideMagDialog } from '@/features/return-project-from-outside-mag'
import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  ProjectsTableView,
  useOutsideMagTableQuery,
  type ColumnFilterKey,
  type ColumnFilters,
} from '@/widgets/projects-table'

import { env } from '@/shared/config/env'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import { OUTSIDE_MAG_MOCK_PROJECTS } from '../model/outside-mag-mock-projects'
import { OutsideMagSearchToolbar } from './outside-mag-search-toolbar'
import { ReturnFromOutsideMagButton } from './return-from-outside-mag-button'

/** Только явный флаг; в dev без VITE_USE_MOCKS=true — реальный GET /projects/out-of-mag/. */
const isOutsideMagMocksEnabled = env.USE_MOCKS

interface OutsideMagBoardProps {
  listDateParams: BoardListParams
}

export function OutsideMagBoard({ listDateParams }: OutsideMagBoardProps) {
  const [search, setSearch] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)
  const [returnTarget, setReturnTarget] = useState<Project | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { halls, lofts } = useVenueCatalog()
  const venueFilterIds = useMemo(
    () => resolveVenueFilterIds(columnFilters.loft, columnFilters.hall, halls, lofts),
    [columnFilters.loft, columnFilters.hall, halls, lofts],
  )

  const {
    selectOptions,
    filterOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()

  const listParams = useMemo(
    () => ({
      ...listDateParams,
      search: debouncedSearch.trim() || undefined,
      ...(isOutsideMagMocksEnabled ? {} : venueFilterIds),
    }),
    [listDateParams, debouncedSearch, venueFilterIds],
  )

  const query = useOutsideMagTableQuery(
    listParams,
    columnFilters.manager,
    columnFilters.plumEventStatus,
    { enabled: !isOutsideMagMocksEnabled },
  )

  const projects = isOutsideMagMocksEnabled ? OUTSIDE_MAG_MOCK_PROJECTS : query.projects
  const hasNextPage = isOutsideMagMocksEnabled ? false : query.hasNextPage
  const isLoading = isOutsideMagMocksEnabled ? false : query.isLoading
  const isError = isOutsideMagMocksEnabled ? false : query.isError
  const isFetchingNextPage = isOutsideMagMocksEnabled ? false : query.isFetchingNextPage
  const fetchNextPage = query.fetchNextPage

  const managerFilterName = useMemo(
    () => resolveManagerFilterName(columnFilters.manager, selectOptions),
    [columnFilters.manager, selectOptions],
  )

  const filtered = useMemo(() => {
    // Поиск серверный; для dev-моков (бэк не вызывается) фильтруем по названию на клиенте.
    const source =
      isOutsideMagMocksEnabled && debouncedSearch.trim()
        ? projects.filter((p) =>
            p.title.toLowerCase().includes(debouncedSearch.trim().toLowerCase()),
          )
        : projects
    return filterProjectsTable(source, {
      columns: columnFilters,
      columnView: 'outside-mag',
      clientSideLoftHall: isOutsideMagMocksEnabled,
      ...(isOutsideMagMocksEnabled ? { managerName: managerFilterName } : {}),
    })
  }, [projects, debouncedSearch, columnFilters, managerFilterName])

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handlePlumEventStatusChange = (values: string[]) => {
    setColumnFilters((prev) => ({ ...prev, plumEventStatus: values }))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <OutsideMagSearchToolbar search={search} onChangeSearch={setSearch} />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ProjectsTableView
          projects={filtered}
          columnView="outside-mag"
          columnFilters={columnFilters}
          managerFilterOptions={filterOptions}
          directoryOptions={selectOptions}
          managersSelectLoading={isManagersLoading}
          managersSelectError={isManagersError}
          onColumnFilterChange={handleColumnFilterChange}
          onPlumEventStatusChange={handlePlumEventStatusChange}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          backOrigin={OUTSIDE_MAG_BACK_ORIGIN}
          renderRowAction={(project) => (
            <ReturnFromOutsideMagButton onClick={() => setReturnTarget(project)} />
          )}
        />
      </div>

      <ReturnProjectFromOutsideMagDialog
        open={returnTarget !== null}
        onOpenChange={(open) => {
          if (!open) setReturnTarget(null)
        }}
        project={returnTarget}
      />
    </div>
  )
}
