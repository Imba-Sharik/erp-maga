import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useManagerVenueRestriction, useManagersDirectory } from '@/entities/manager'
import type { Project } from '@/entities/project'
import { resolveVenueFilterIds, useVenueCatalog } from '@/entities/venue'
import { useDebouncedValue } from '@/shared/hooks'

import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  type ColumnFilterKey,
  type ColumnFilters,
} from '../lib/filter-projects-table'
import { applyColumnFilterChange } from '../lib/apply-column-filter-change'
import type { ProjectsTableColumnView } from '../lib/economics-columns'
import { useProjectsTableQuery } from '../lib/use-projects-table-query'
import { ProjectsTableToolbar } from './projects-table-toolbar'
import { ProjectsTableView } from './projects-table-view'

interface ProjectsTableProps {
  onAddProject?: () => void
  managerEditable?: boolean
  renderRowAction?: (project: Project) => ReactNode
}

export function ProjectsTable({
  onAddProject,
  managerEditable = true,
  renderRowAction,
}: ProjectsTableProps = {}) {
  const [search, setSearch] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)
  const [columnView, setColumnView] = useState<ProjectsTableColumnView>('general')
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
    setColumnFilters((prev) => applyColumnFilterChange(prev, key, value))
  }

  const handlePlumEventStatusChange = (values: string[]) => {
    setColumnFilters((prev) => ({ ...prev, plumEventStatus: values }))
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
