import { useMemo, useState } from 'react'

import type { Project, ProjectBackOrigin } from '@/entities/project'
import { resolveManagerFilterName, useManagersDirectory } from '@/entities/manager'
import { useUserRole } from '@/entities/user-role'
import { ChangeProjectManagerDialog } from '@/features/change-project-manager'
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
  const role = useUserRole()
  const [archiveMode, setArchiveMode] = useState(false)
  const [changeManagerTarget, setChangeManagerTarget] = useState<Project | null>(null)

  const {
    selectOptions,
    filterOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()

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

  const archiveQuery = useClosingArchiveQuery()

  const archiveManagerFilterName = useMemo(
    () => resolveManagerFilterName(columnFilters.manager, selectOptions),
    [columnFilters.manager, selectOptions],
  )

  const filteredArchive = useMemo(
    () =>
      filterProjectsTable(archiveQuery.projects, {
        search: archiveSearch,
        columns: columnFilters,
        columnView,
        managerName: archiveManagerFilterName,
      }),
    [archiveQuery.projects, archiveSearch, columnFilters, columnView, archiveManagerFilterName],
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
            managerFilterOptions={filterOptions}
            directoryOptions={selectOptions}
            managersSelectLoading={isManagersLoading}
            managersSelectError={isManagersError}
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
            onChangeManager={role === 'director' ? setChangeManagerTarget : undefined}
          />
        </div>
      )}

      <ChangeProjectManagerDialog
        open={changeManagerTarget !== null}
        onOpenChange={(open) => {
          if (!open) setChangeManagerTarget(null)
        }}
        projectId={changeManagerTarget?.id ?? ''}
        projectTitle={changeManagerTarget?.title}
        currentManager={changeManagerTarget?.manager ?? ''}
      />
    </div>
  )
}
