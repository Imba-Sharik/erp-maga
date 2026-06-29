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
import { useDebouncedValue, useFilterParams } from '@/shared/hooks'
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

/** Архивные колоночные фильтры → `c*`-ключи URL (отдельно от венью-фильтров канбана). */
const COLUMN_FILTER_PARAM: Record<Exclude<ColumnFilterKey, 'manager'>, string> = {
  loft: 'cloft',
  hall: 'chall',
  stage: 'cstage',
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
  // Фильтры/поиск/сортировка — в URL (переживают F5). Режим «Архив», переключатель
  // канбан/таблица и вид колонок — это вид/режим, в URL не сохраняем (локальный useState).
  // Архивные колоночные фильтры разнесены по `c*`-ключам, чтобы не пересекаться с
  // венью-фильтрами канбана (это независимые наборы); статус Plum общий — ключ `plum`.
  const { getString, getArray, set, patch } = useFilterParams()
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
  const search = getString('q') ?? ''
  const sort = getString('sort') ?? PROJECTS_SORT_DEFAULT
  const city = getString('city')
  const hall = getString('hall')
  const loft = getString('loft')
  const setSearch = (value: string) => set('q', value)
  const setSort = (value: string) => set('sort', value === PROJECTS_SORT_DEFAULT ? null : value)
  const setCity = (value: string | null) => set('city', value)
  const setHall = (value: string | null) => set('hall', value)
  const setLoft = (value: string | null) => set('loft', value)
  const [viewMode, setViewMode] = useState<ClosingViewMode>('kanban')

  // Archive table filters
  const archiveSearch = getString('aq') ?? ''
  const setArchiveSearch = (value: string) => set('aq', value)
  const [columnView, setColumnView] = useState<ClosingColumnView>('closing-general')
  const columnFilters = useMemo<ColumnFilters>(
    () => ({
      loft: getString('cloft'),
      hall: getString('chall'),
      manager: getString('cmanager'),
      stage: getString('cstage'),
      plumEventStatus: getArray('plum'),
    }),
    [getString, getArray],
  )

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
    // Смена менеджера сбрасывает зал и LOFT — они могут быть недоступны у нового менеджера.
    if (key === 'manager') patch({ cmanager: value, chall: null, cloft: null })
    else set(COLUMN_FILTER_PARAM[key], value)
  }

  const handlePlumEventStatusChange = (values: string[]) => {
    set('plum', values)
  }

  const handleToggleArchive = (value: boolean) => {
    setArchiveMode(value)
    // Сброс колоночных фильтров архива (как было при переключении режима).
    patch({ cloft: null, chall: null, cmanager: null, cstage: null, plum: null })
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
