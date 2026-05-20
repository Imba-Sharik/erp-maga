import { useMemo, useState } from 'react'

import type { ProjectBackOrigin } from '@/entities/project'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  ProjectsTableView,
  type ColumnFilterKey,
  type ColumnFilters,
} from '@/widgets/projects-table'

import { useClosingArchiveQuery } from '../lib/use-closing-archive-query'
import { ClosingBoardToolbar, type ClosingColumnView } from './closing-board-toolbar'
import { ClosingKanban } from './closing-kanban'

const CLOSING_BACK: ProjectBackOrigin = {
  to: '/closing',
  label: 'Закрытие',
}

interface ClosingBoardProps {
  listDateParams: BoardListParams
  onArchiveModeChange?: (archiveMode: boolean) => void
}

export function ClosingBoard({ listDateParams, onArchiveModeChange }: ClosingBoardProps) {
  const [archiveMode, setArchiveMode] = useState(false)

  // Kanban filters
  const [search, setSearch] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)

  // Archive table filters
  const [archiveSearch, setArchiveSearch] = useState('')
  const [columnView, setColumnView] = useState<ClosingColumnView>('closing-general')
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)

  const filtersActive = search.trim() !== '' || city !== null || hall !== null || loft !== null
  const filter = useMemo(() => ({ search, city, hall, loft }), [search, city, hall, loft])

  // Archive query
  const archiveQuery = useClosingArchiveQuery()

  const archiveManagerOptions = useMemo(() => {
    const names = new Set<string>()
    for (const project of archiveQuery.projects) {
      if (project.manager) names.add(project.manager)
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'ru'))
  }, [archiveQuery.projects])

  const filteredArchive = useMemo(
    () =>
      filterProjectsTable(archiveQuery.projects, {
        search: archiveSearch,
        columns: columnFilters,
        columnView,
      }),
    [archiveQuery.projects, archiveSearch, columnFilters, columnView],
  )

  const handleColumnFilterChange = (key: ColumnFilterKey, value: string | null) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleToggleArchive = (value: boolean) => {
    setArchiveMode(value)
    setColumnFilters(EMPTY_COLUMN_FILTERS)
    onArchiveModeChange?.(value)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      {archiveMode ? (
        <ClosingBoardToolbar
          archiveMode={true}
          search={archiveSearch}
          columnView={columnView}
          onChangeSearch={setArchiveSearch}
          onColumnViewChange={setColumnView}
          onToggleArchive={handleToggleArchive}
        />
      ) : (
        <ClosingBoardToolbar
          archiveMode={false}
          search={search}
          city={city}
          hall={hall}
          loft={loft}
          onChangeSearch={setSearch}
          onChangeCity={setCity}
          onChangeHall={setHall}
          onChangeLoft={setLoft}
          onToggleArchive={handleToggleArchive}
        />
      )}

      {archiveMode ? (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ProjectsTableView
            projects={filteredArchive}
            columnView={columnView}
            columnFilters={columnFilters}
            managerOptions={archiveManagerOptions}
            onColumnFilterChange={handleColumnFilterChange}
            isLoading={archiveQuery.isLoading}
            isError={archiveQuery.isError}
            hasNextPage={archiveQuery.hasNextPage}
            isFetchingNextPage={archiveQuery.isFetchingNextPage}
            onLoadMore={archiveQuery.fetchNextPage}
            backOrigin={CLOSING_BACK}
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ClosingKanban
            listParams={listDateParams}
            filter={filter}
            filtersActive={filtersActive}
          />
        </div>
      )}
    </div>
  )
}
