import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useManagerVenueRestriction, useManagersDirectory } from '@/entities/manager'
import type { Project } from '@/entities/project'
import { resolveVenueFilterIds, useVenueCatalog } from '@/entities/venue'
import { useDebouncedValue, useFilterParams } from '@/shared/hooks'

import {
  filterProjectsTable,
  type ColumnFilterKey,
  type ColumnFilters,
} from '../lib/filter-projects-table'
import type { ProjectsTableColumnView } from '../lib/economics-columns'
import { useProjectsTableQuery } from '../lib/use-projects-table-query'
import { ProjectsTableToolbar } from './projects-table-toolbar'
import { ProjectsTableView } from './projects-table-view'

/** Ключи URL, которые персистим для таблицы всех проектов. */
const PROJECTS_TABLE_FILTER_KEYS = [
  'q',
  'pending',
  'loft',
  'hall',
  'manager',
  'stage',
  'plum',
] as const

interface ProjectsTableProps {
  onAddProject?: () => void
  managerEditable?: boolean
  renderRowAction?: (project: Project) => ReactNode
  /** Переключатель «канбан ⇄ таблица» — рендерится в тулбаре */
  viewModeToggle?: ReactNode
}

export function ProjectsTable({
  onAddProject,
  managerEditable = true,
  renderRowAction,
  viewModeToggle,
}: ProjectsTableProps = {}) {
  // Поиск, тумблер «Ожидают обработки» и фильтры колонок живут в URL (переживают F5) и
  // дублируются в localStorage (переживают закрытие вкладки). Вид колонок (general/economics)
  // — вне объёма, остаётся локальным.
  const { getString, getArray, set, patch } = useFilterParams({
    scope: 'projects-table',
    params: PROJECTS_TABLE_FILTER_KEYS,
  })
  const search = getString('q') ?? ''
  const pendingOnly = getString('pending') === '1'
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
  const [columnView, setColumnView] = useState<ProjectsTableColumnView>('general')
  const setSearch = (value: string) => set('q', value)
  const setPendingOnly = (value: boolean) => set('pending', value ? '1' : null)
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

  const { projects, hasNextPage, isLoading, isError, isFetchingNextPage, fetchNextPage } =
    useProjectsTableQuery({
      pendingOnly,
      stage: columnFilters.stage,
      magManagerId: columnFilters.manager,
      plumEventStatus: columnFilters.plumEventStatus,
      search: debouncedSearch,
      ...venueFilterIds,
    })

  const filtered = useMemo(
    () => filterProjectsTable(projects, { columns: columnFilters, columnView }),
    [projects, columnFilters, columnView],
  )

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    // Смена менеджера сбрасывает зал и LOFT — они могут быть недоступны у нового менеджера.
    if (key === 'manager') patch({ manager: value, hall: null, loft: null })
    else set(key, value)
  }

  const handlePlumEventStatusChange = (values: string[]) => {
    set('plum', values)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <ProjectsTableToolbar
        search={search}
        pendingOnly={pendingOnly}
        columnView={columnView}
        onChangeSearch={setSearch}
        onTogglePending={setPendingOnly}
        onColumnViewChange={setColumnView}
        onAddProject={onAddProject}
        viewModeToggle={viewModeToggle}
      />
      <ProjectsTableView
        projects={filtered}
        columnView={columnView}
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
        managerEditable={managerEditable}
        renderRowAction={renderRowAction}
      />
    </div>
  )
}
