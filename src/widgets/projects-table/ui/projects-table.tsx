import { useMemo, useState } from 'react'

import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  type ColumnFilterKey,
  type ColumnFilters,
} from '../lib/filter-projects-table'
import { useProjectsTableQuery } from '../lib/use-projects-table-query'
import { ProjectsTableToolbar } from './projects-table-toolbar'
import { ProjectsTableView } from './projects-table-view'

export function ProjectsTable() {
  const [search, setSearch] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)

  // Этап и тумблер «Ожидают обработки» меняют сам запрос (набор этапов).
  const { projects, hasNextPage, isLoading, isError, isFetchingNextPage, fetchNextPage } =
    useProjectsTableQuery({ pendingOnly, stage: columnFilters.stage })

  // Опции «Отв. менеджер» — уникальные менеджеры из загруженных страниц.
  const managerOptions = useMemo(() => {
    const names = new Set<string>()
    for (const project of projects) {
      if (project.manager) names.add(project.manager)
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'ru'))
  }, [projects])

  const filtered = useMemo(
    () => filterProjectsTable(projects, { search, columns: columnFilters }),
    [projects, search, columnFilters],
  )

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
      <ProjectsTableToolbar
        search={search}
        pendingOnly={pendingOnly}
        onChangeSearch={setSearch}
        onTogglePending={setPendingOnly}
      />
      <ProjectsTableView
        projects={filtered}
        columnFilters={columnFilters}
        managerOptions={managerOptions}
        onColumnFilterChange={handleColumnFilterChange}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  )
}
