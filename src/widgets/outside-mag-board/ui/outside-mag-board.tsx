import { useMemo, useState } from 'react'

import { OUTSIDE_MAG_BACK_ORIGIN, type Project } from '@/entities/project'
import { useManagerVenueRestriction, useManagersDirectory } from '@/entities/manager'
import { resolveVenueFilterIds, useVenueCatalog } from '@/entities/venue'
import { ReturnProjectFromOutsideMagDialog } from '@/features/return-project-from-outside-mag'
import {
  filterProjectsTable,
  ProjectsTableView,
  useOutsideMagTableQuery,
  type ColumnFilterKey,
  type ColumnFilters,
} from '@/widgets/projects-table'

import { env } from '@/shared/config'
import { useDebouncedValue, useFilterParams } from '@/shared/hooks'
import type { BoardListParams } from '@/shared/api'
import { OUTSIDE_MAG_MOCK_PROJECTS } from '../model/outside-mag-mock-projects'
import { OutsideMagSearchToolbar } from './outside-mag-search-toolbar'
import { ReturnFromOutsideMagButton } from './return-from-outside-mag-button'

/** Только явный флаг; в dev без VITE_USE_MOCKS=true — реальный GET /projects/out-of-mag/. */
const isOutsideMagMocksEnabled = env.USE_MOCKS

/** Ключи URL, которые персистим для экрана «Вне контура MAG». */
const OUTSIDE_MAG_FILTER_KEYS = ['q', 'loft', 'hall', 'manager', 'stage', 'plum'] as const

interface OutsideMagBoardProps {
  listDateParams: BoardListParams
}

export function OutsideMagBoard({ listDateParams }: OutsideMagBoardProps) {
  // Поиск и фильтры колонок живут в URL (переживают F5) и дублируются в localStorage
  // (переживают закрытие вкладки / новое окно).
  const { getString, getArray, set, patch } = useFilterParams({
    scope: 'outside-mag',
    params: OUTSIDE_MAG_FILTER_KEYS,
  })
  const search = getString('q') ?? ''
  const setSearch = (value: string) => set('q', value)
  const columnFilters = useMemo<ColumnFilters>(
    () => ({
      loft: getString('loft'),
      hall: getString('hall'),
      manager: getString('manager'),
      stage: getString('stage'),
      plumEventStatus: getArray('plum'),
    }),
    [getString, getArray],
  )
  const [returnTarget, setReturnTarget] = useState<Project | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const { halls, lofts } = useVenueCatalog()
  const venueFilterIds = useMemo(
    () => resolveVenueFilterIds(columnFilters.loft, columnFilters.hall, halls, lofts),
    [columnFilters.loft, columnFilters.hall, halls, lofts],
  )

  const {
    managers,
    filterOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()

  const { restrictToHallIds, venueSelectDisabled } = useManagerVenueRestriction({
    managerId: columnFilters.manager,
    managers,
    managersLoading: isManagersLoading,
  })

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

  const managerFilterName = useMemo(() => {
    if (!columnFilters.manager) return null
    return filterOptions.find((option) => option.value === columnFilters.manager)?.label ?? null
  }, [columnFilters.manager, filterOptions])

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
    // Смена менеджера сбрасывает зал и LOFT — они могут быть недоступны у нового менеджера.
    if (key === 'manager') patch({ manager: value, hall: null, loft: null })
    else set(key, value)
  }

  const handlePlumEventStatusChange = (values: string[]) => {
    set('plum', values)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <OutsideMagSearchToolbar search={search} onChangeSearch={setSearch} />
      <ProjectsTableView
        projects={filtered}
        columnView="outside-mag"
        columnFilters={columnFilters}
        managerFilterOptions={filterOptions}
        managersSelectLoading={isManagersLoading}
        managersSelectError={isManagersError}
        restrictToHallIds={restrictToHallIds}
        venueSelectDisabled={venueSelectDisabled}
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
