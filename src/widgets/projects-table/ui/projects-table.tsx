import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useManagersDirectory } from '@/entities/manager'
import type { Project } from '@/entities/project'

import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  type ColumnFilterKey,
  type ColumnFilters,
} from '../lib/filter-projects-table'
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

  const {
    selectOptions,
    filterOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()

  const { projects, hasNextPage, isLoading, isError, isFetchingNextPage, fetchNextPage } =
    useProjectsTableQuery({
      pendingOnly,
      stage: columnFilters.stage,
      magManagerId: columnFilters.manager,
    })

  const filtered = useMemo(
    () => filterProjectsTable(projects, { search, columns: columnFilters, columnView }),
    [projects, search, columnFilters, columnView],
  )

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
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
        directoryOptions={selectOptions}
        managersSelectLoading={isManagersLoading}
        managersSelectError={isManagersError}
        onColumnFilterChange={handleColumnFilterChange}
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
