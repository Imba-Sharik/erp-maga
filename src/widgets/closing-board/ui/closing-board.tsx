import { useMemo, useState } from 'react'

import type { Project, ProjectBackOrigin } from '@/entities/project'
import { resolveManagerFilterName, useManagersDirectory } from '@/entities/manager'
import { useUserRole } from '@/entities/user-role'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { ChangeManagerButton, ChangeProjectManagerDialog } from '@/features/change-project-manager'
import { DeleteProjectButton } from '@/features/delete-project'
import { filterProjects } from '@/widgets/projects-board/lib/filter-projects'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import {
  EMPTY_COLUMN_FILTERS,
  filterProjectsTable,
  ProjectsTableView,
  type ColumnFilterKey,
  type ColumnFilters,
} from '@/widgets/projects-table'

import { useClosingActiveTableQuery } from '../lib/use-closing-active-table-query'
import { useClosingArchiveQuery } from '../lib/use-closing-archive-query'
import { ClosingBoardToolbar, type ClosingColumnView } from './closing-board-toolbar'
import type { ClosingViewMode } from './closing-view-toggle'
import { ClosingKanban } from './closing-kanban'

const CLOSING_BACK: ProjectBackOrigin = {
  to: '/closing',
  label: 'Закрытие',
}

interface ClosingBoardProps {
  listDateParams: BoardListParams
  onArchiveModeChange?: (archiveMode: boolean) => void
  backOrigin?: ProjectBackOrigin
  onDeleteProject?: (project: Project) => void
  canChangeManager?: boolean
}

export function ClosingBoard({
  listDateParams,
  onArchiveModeChange,
  backOrigin = CLOSING_BACK,
  onDeleteProject,
  canChangeManager = true,
}: ClosingBoardProps) {
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
  const [viewMode, setViewMode] = useState<ClosingViewMode>('kanban')

  // Archive table filters
  const [archiveSearch, setArchiveSearch] = useState('')
  const [columnView, setColumnView] = useState<ClosingColumnView>('closing-general')
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)

  const debouncedSearch = useDebouncedValue(search)
  const debouncedArchiveSearch = useDebouncedValue(archiveSearch)

  const filtersActive = search.trim() !== '' || city !== null || hall !== null || loft !== null
  // Поиск канбана уходит на сервер через listParams; клиентский filter только по фасетам.
  const filter = useMemo(() => ({ search: '', city, hall, loft }), [city, hall, loft])
  const kanbanListParams = useMemo(
    () => ({ ...listDateParams, search: debouncedSearch.trim() || undefined }),
    [listDateParams, debouncedSearch],
  )

  // Табличный вид активного закрытия: один запрос на все closing-этапы,
  // фасетные фильтры (город/зал/LOFT) — на клиенте, как в канбане.
  const activeTableQuery = useClosingActiveTableQuery({
    listParams: kanbanListParams,
    plumEventStatus: columnFilters.plumEventStatus,
    enabled: !archiveMode && viewMode === 'table',
  })
  const filteredActiveTable = useMemo(
    () => filterProjects(activeTableQuery.projects, filter),
    [activeTableQuery.projects, filter],
  )

  const archiveQuery = useClosingArchiveQuery({
    enabled: archiveMode,
    search: debouncedArchiveSearch,
  })

  const archiveManagerFilterName = useMemo(
    () => resolveManagerFilterName(columnFilters.manager, selectOptions),
    [columnFilters.manager, selectOptions],
  )

  const filteredArchive = useMemo(
    () =>
      filterProjectsTable(archiveQuery.projects, {
        columns: columnFilters,
        columnView,
        managerName: archiveManagerFilterName,
      }),
    [archiveQuery.projects, columnFilters, columnView, archiveManagerFilterName],
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
    <div className="@container flex h-full min-h-0 flex-1 flex-col gap-3 @3xl:gap-6">
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
          viewMode={viewMode}
          onChangeSearch={setSearch}
          onChangeCity={setCity}
          onChangeHall={setHall}
          onChangeLoft={setLoft}
          onViewModeChange={setViewMode}
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
            backOrigin={backOrigin}
            managerEditable={canChangeManager}
            renderRowAction={
              onDeleteProject
                ? (project) => (
                    <DeleteProjectButton onRequestDelete={() => onDeleteProject(project)} />
                  )
                : undefined
            }
          />
        </div>
      ) : viewMode === 'table' ? (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ProjectsTableView
            projects={filteredActiveTable}
            columnView="closing-active"
            columnFilters={EMPTY_COLUMN_FILTERS}
            managerFilterOptions={filterOptions}
            directoryOptions={selectOptions}
            managersSelectLoading={isManagersLoading}
            managersSelectError={isManagersError}
            onColumnFilterChange={() => {}}
            isLoading={activeTableQuery.isLoading}
            isError={activeTableQuery.isError}
            hasNextPage={activeTableQuery.hasNextPage}
            isFetchingNextPage={activeTableQuery.isFetchingNextPage}
            onLoadMore={activeTableQuery.fetchNextPage}
            backOrigin={backOrigin}
            managerEditable={false}
            renderRowAction={
              canChangeManager && role === 'director'
                ? (project) => (
                    <ChangeManagerButton onRequestChange={() => setChangeManagerTarget(project)} />
                  )
                : undefined
            }
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ClosingKanban
            listParams={kanbanListParams}
            filter={filter}
            filtersActive={filtersActive}
            backOrigin={backOrigin}
            onChangeManager={
              canChangeManager && role === 'director' ? setChangeManagerTarget : undefined
            }
            onDeleteProject={onDeleteProject}
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
