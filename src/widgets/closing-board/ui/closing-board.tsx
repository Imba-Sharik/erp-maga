import { useMemo, useState } from 'react'

import {
  PROJECTS_SORT_DEFAULT,
  type Project,
  type ProjectAssistantManager,
  type ProjectBackOrigin,
} from '@/entities/project'
import { useManagerVenueRestriction, useManagersDirectory } from '@/entities/manager'
import { resolveVenueFilterIds, useVenueCatalog } from '@/entities/venue'
import { useUserRole } from '@/entities/user-role'
import { useDebouncedValue } from '@/shared/hooks'
import {
  ChangeProjectManagerDialog,
  useChangeProjectManagers,
} from '@/features/change-project-manager'
import {
  AssistantManagerDialog,
  AssistantMenuItems,
  type AssistantDialogMode,
} from '@/features/manage-assistant-managers'
import { DeleteProjectButton } from '@/features/delete-project'
import { buildKanbanListParams } from '@/features/kanban-board'
import type { BoardListParams } from '@/shared/api'
import {
  EMPTY_COLUMN_FILTERS,
  applyColumnFilterChange,
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
  const [assistantTarget, setAssistantTarget] = useState<{
    project: Project
    mode: AssistantDialogMode
    assistant?: ProjectAssistantManager
  } | null>(null)
  const {
    submit: applyManagers,
    isPending: isApplyingAssistant,
    errorMessage: assistantError,
  } = useChangeProjectManagers({ onSuccess: () => setAssistantTarget(null) })

  const {
    managers,
    filterOptions,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useManagersDirectory()

  // Kanban filters
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(PROJECTS_SORT_DEFAULT)
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ClosingViewMode>('kanban')

  // Archive table filters
  const [archiveSearch, setArchiveSearch] = useState('')
  const [columnView, setColumnView] = useState<ClosingColumnView>('closing-general')
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(EMPTY_COLUMN_FILTERS)

  const { restrictToHallIds, venueSelectDisabled } = useManagerVenueRestriction({
    managerId: columnFilters.manager,
    managers,
    managersLoading: isManagersLoading,
  })

  const debouncedSearch = useDebouncedValue(search)
  const debouncedArchiveSearch = useDebouncedValue(archiveSearch)

  const { halls, lofts } = useVenueCatalog()

  const kanbanVenueFilterIds = useMemo(
    () => resolveVenueFilterIds(loft, hall, halls, lofts),
    [loft, hall, halls, lofts],
  )

  const archiveVenueFilterIds = useMemo(
    () => resolveVenueFilterIds(columnFilters.loft, columnFilters.hall, halls, lofts),
    [columnFilters.loft, columnFilters.hall, halls, lofts],
  )

  // Поиск, статус Plum, loft/hall и город уходят на сервер через listParams.
  const kanbanListParams = useMemo(
    () =>
      buildKanbanListParams(listDateParams, {
        search: debouncedSearch,
        plumEventStatus: columnFilters.plumEventStatus,
        city,
        ordering: sort,
        ...kanbanVenueFilterIds,
      }),
    [
      listDateParams,
      debouncedSearch,
      columnFilters.plumEventStatus,
      city,
      sort,
      kanbanVenueFilterIds,
    ],
  )

  // Табличный вид активного закрытия: один запрос на все closing-этапы;
  // город/зал/LOFT уже применены на сервере через `kanbanListParams`.
  const activeTableQuery = useClosingActiveTableQuery({
    listParams: kanbanListParams,
    plumEventStatus: columnFilters.plumEventStatus,
    enabled: !archiveMode && viewMode === 'table',
  })

  const archiveQuery = useClosingArchiveQuery({
    enabled: archiveMode,
    search: debouncedArchiveSearch,
    ...archiveVenueFilterIds,
  })

  const archiveManagerFilterName = useMemo(() => {
    if (!columnFilters.manager) return null
    return filterOptions.find((option) => option.value === columnFilters.manager)?.label ?? null
  }, [columnFilters.manager, filterOptions])

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
    setColumnFilters((prev) => applyColumnFilterChange(prev, key, value))
  }

  const handlePlumEventStatusChange = (values: string[]) => {
    setColumnFilters((prev) => ({ ...prev, plumEventStatus: values }))
  }

  const handleToggleArchive = (value: boolean) => {
    setArchiveMode(value)
    setColumnFilters(EMPTY_COLUMN_FILTERS)
    onArchiveModeChange?.(value)
  }

  return (
    <div className="@container flex min-h-0 flex-1 flex-col gap-3 @3xl:gap-6">
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
          sort={sort}
          city={city}
          hall={hall}
          loft={loft}
          plumEventStatus={columnFilters.plumEventStatus}
          viewMode={viewMode}
          onChangeSearch={setSearch}
          onChangeSort={setSort}
          onChangeCity={setCity}
          onChangeHall={setHall}
          onChangeLoft={setLoft}
          onChangePlumEventStatus={handlePlumEventStatusChange}
          onViewModeChange={setViewMode}
          onToggleArchive={handleToggleArchive}
        />
      )}

      {archiveMode ? (
        <ProjectsTableView
          projects={filteredArchive}
          columnView={columnView}
          columnFilters={columnFilters}
          managerFilterOptions={filterOptions}
          managersSelectLoading={isManagersLoading}
          managersSelectError={isManagersError}
          restrictToHallIds={restrictToHallIds}
          venueSelectDisabled={venueSelectDisabled}
          onColumnFilterChange={handleColumnFilterChange}
          onPlumEventStatusChange={handlePlumEventStatusChange}
          isLoading={archiveQuery.isLoading}
          isError={archiveQuery.isError}
          hasNextPage={archiveQuery.hasNextPage}
          isFetchingNextPage={archiveQuery.isFetchingNextPage}
          onLoadMore={archiveQuery.fetchNextPage}
          backOrigin={backOrigin}
          managerEditable={canChangeManager && role === 'director'}
          renderRowAction={
            onDeleteProject
              ? (project) => (
                  <DeleteProjectButton onRequestDelete={() => onDeleteProject(project)} />
                )
              : undefined
          }
        />
      ) : viewMode === 'table' ? (
        <ProjectsTableView
          projects={activeTableQuery.projects}
          columnView="closing-active"
          columnFilters={columnFilters}
          managerFilterOptions={filterOptions}
          managersSelectLoading={isManagersLoading}
          managersSelectError={isManagersError}
          restrictToHallIds={restrictToHallIds}
          venueSelectDisabled={venueSelectDisabled}
          onColumnFilterChange={handleColumnFilterChange}
          onPlumEventStatusChange={handlePlumEventStatusChange}
          isLoading={activeTableQuery.isLoading}
          isError={activeTableQuery.isError}
          hasNextPage={activeTableQuery.hasNextPage}
          isFetchingNextPage={activeTableQuery.isFetchingNextPage}
          onLoadMore={activeTableQuery.fetchNextPage}
          backOrigin={backOrigin}
          managerEditable={canChangeManager && role === 'director'}
        />
      ) : (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ClosingKanban
            listParams={kanbanListParams}
            backOrigin={backOrigin}
            onChangeManager={
              canChangeManager && role === 'director' ? setChangeManagerTarget : undefined
            }
            onDeleteProject={onDeleteProject}
            renderAssistantMenu={(project) => (
              <AssistantMenuItems
                project={project}
                onAdd={() => setAssistantTarget({ project, mode: 'add' })}
                onEdit={(assistant) => setAssistantTarget({ project, mode: 'edit', assistant })}
              />
            )}
          />
        </div>
      )}

      <ChangeProjectManagerDialog
        open={changeManagerTarget !== null}
        onOpenChange={(open) => {
          if (!open) setChangeManagerTarget(null)
        }}
        project={changeManagerTarget}
      />

      <AssistantManagerDialog
        open={assistantTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssistantTarget(null)
        }}
        project={assistantTarget?.project ?? null}
        mode={assistantTarget?.mode ?? 'add'}
        editingAssistant={assistantTarget?.assistant ?? null}
        isPending={isApplyingAssistant}
        errorMessage={assistantError}
        onApply={(assistants) => {
          const target = assistantTarget?.project
          if (!target) return
          applyManagers({
            project: target,
            leadId: target.leadManagerId ?? null,
            leadName: target.manager,
            assistants,
          })
        }}
      />
    </div>
  )
}
