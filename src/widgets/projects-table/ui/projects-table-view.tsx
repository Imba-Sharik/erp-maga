import { useCallback, useState, type ReactNode } from 'react'

import {
  ALL_STAGE_LABELS,
  ALL_STAGE_ORDER,
  type Project,
  type ProjectBackOrigin,
} from '@/entities/project'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'
import { GridTableHeaderCell, GridTableHeaderLabel, GridTableView } from '@/shared/ui/grid-table'

import type { ProjectsTableColumnView } from '../lib/economics-columns'
import type { ColumnFilterKey, ColumnFilters } from '../lib/filter-projects-table'
import { assignProjectManagerMock } from '@/entities/manager'
import { getTableGridTemplate, getTableMinWidth, TABLE_COLUMN_COUNT } from '../lib/table-columns'
import {
  HEADER_FILTER_TRIGGER,
  TableHeaderHallFilter,
  TableHeaderLoftFilter,
  TableHeaderManagerFilter,
} from './table-header-filters'
import { ProjectsTableRow } from './projects-table-row'

const DEFAULT_BACK_ORIGIN: ProjectBackOrigin = { to: '/projects', label: 'Все проекты' }

/** Все 12 этапов воронки — фиксированный список для фильтра «Этап проекта». */
const STAGE_OPTIONS: SelectOption[] = ALL_STAGE_ORDER.map((stage) => ({
  value: stage,
  label: ALL_STAGE_LABELS[stage],
}))

interface ProjectsTableViewProps {
  projects: Project[]
  columnView: ProjectsTableColumnView
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  backOrigin?: ProjectBackOrigin
  renderRowAction?: (project: Project) => ReactNode
}

export function ProjectsTableView({
  projects,
  columnView,
  columnFilters,
  managerOptions,
  onColumnFilterChange,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  backOrigin = DEFAULT_BACK_ORIGIN,
  renderRowAction,
}: ProjectsTableViewProps) {
  const gridTemplate = getTableGridTemplate(columnView)
  const minWidth = getTableMinWidth(columnView)
  const [managerOverrides, setManagerOverrides] = useState<Record<string, string>>({})
  const [editingManagerProjectId, setEditingManagerProjectId] = useState<string | null>(null)

  const getDisplayManager = useCallback(
    (project: Project) => managerOverrides[project.id] ?? project.manager,
    [managerOverrides],
  )

  const handleStartEditManager = useCallback((projectId: string) => {
    setEditingManagerProjectId(projectId)
  }, [])

  const handleCancelEditManager = useCallback(() => {
    setEditingManagerProjectId(null)
  }, [])

  const handleAssignManager = useCallback((projectId: string, manager: string) => {
    setManagerOverrides((prev) => ({ ...prev, [projectId]: manager }))
    assignProjectManagerMock(projectId, manager)
    setEditingManagerProjectId(null)
  }, [])

  const header =
    columnView === 'requests' ? (
      <RequestsTableHeader />
    ) : columnView === 'closed-requests' ? (
      <ClosedRequestsTableHeader />
    ) : columnView === 'general' ? (
      <GeneralTableHeader
        columnFilters={columnFilters}
        managerOptions={managerOptions}
        onColumnFilterChange={onColumnFilterChange}
      />
    ) : columnView === 'economics' ? (
      <EconomicsTableHeader
        columnFilters={columnFilters}
        managerOptions={managerOptions}
        onColumnFilterChange={onColumnFilterChange}
      />
    ) : columnView === 'closing-general' ? (
      <ClosingGeneralTableHeader
        columnFilters={columnFilters}
        managerOptions={managerOptions}
        onColumnFilterChange={onColumnFilterChange}
      />
    ) : columnView === 'closing-economics' ? (
      <ClosingEconomicsTableHeader
        columnFilters={columnFilters}
        managerOptions={managerOptions}
        onColumnFilterChange={onColumnFilterChange}
      />
    ) : (
      <OutsideMagTableHeader
        columnFilters={columnFilters}
        managerOptions={managerOptions}
        onColumnFilterChange={onColumnFilterChange}
      />
    )

  return (
    <GridTableView
      minWidth={minWidth}
      gridTemplate={gridTemplate}
      header={header}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Не удалось загрузить проекты."
      isEmpty={!isLoading && !isError && projects.length === 0}
      emptyMessage="Проекты не найдены."
      skeletonColumnCount={TABLE_COLUMN_COUNT[columnView]}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={onLoadMore}
    >
      {projects.map((project) => (
        <ProjectsTableRow
          key={project.id}
          project={project}
          columnView={columnView}
          backOrigin={backOrigin}
          renderRowAction={renderRowAction}
          displayManager={getDisplayManager(project)}
          managerOptions={managerOptions}
          isEditingManager={editingManagerProjectId === project.id}
          onStartEditManager={() => handleStartEditManager(project.id)}
          onAssignManager={(manager) => handleAssignManager(project.id, manager)}
          onCancelEditManager={handleCancelEditManager}
        />
      ))}
    </GridTableView>
  )
}

function GeneralTableHeader({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
}: {
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
}) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderLoftFilter
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <TableHeaderHallFilter
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerOptions}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <ClearableSelect
          placeholder="Этап проекта"
          value={columnFilters.stage}
          options={STAGE_OPTIONS}
          onChange={(v) => onColumnFilterChange('stage', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Телефон</GridTableHeaderLabel>
      <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
    </>
  )
}

function OutsideMagTableHeader({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
}: {
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
}) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderLoftFilter
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <TableHeaderHallFilter
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerOptions}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Крайний этап</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата перевода</GridTableHeaderLabel>
      <GridTableHeaderLabel>Кто перевёл</GridTableHeaderLabel>
      <GridTableHeaderLabel>Причина перевода</GridTableHeaderLabel>
      <GridTableHeaderLabel>Комментарий</GridTableHeaderLabel>
      <GridTableHeaderCell aria-hidden />
    </>
  )
}

function EconomicsTableHeader({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
}: {
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
}) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerOptions}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <ClearableSelect
          placeholder="Этап проекта"
          value={columnFilters.stage}
          options={STAGE_OPTIONS}
          onChange={(v) => onColumnFilterChange('stage', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Сумма продаж</GridTableHeaderLabel>
      <GridTableHeaderLabel>Чистая прибыль</GridTableHeaderLabel>
      <GridTableHeaderLabel>Итоговый бонус</GridTableHeaderLabel>
    </>
  )
}

function ClosingGeneralTableHeader({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
}: {
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
}) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderLoftFilter
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <TableHeaderHallFilter
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerOptions}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Телефон</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата архивации</GridTableHeaderLabel>
    </>
  )
}

function ClosingEconomicsTableHeader({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
}: {
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
}) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerOptions}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Сумма продаж</GridTableHeaderLabel>
      <GridTableHeaderLabel>Чистая прибыль</GridTableHeaderLabel>
      <GridTableHeaderLabel>Итоговый бонус</GridTableHeaderLabel>
    </>
  )
}

/** Запросы бухгалтера — фиксированные колонки без фильтров. */
function RequestsTableHeader() {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderLabel>LOFT</GridTableHeaderLabel>
      <GridTableHeaderLabel>Зал</GridTableHeaderLabel>
      <GridTableHeaderLabel>Ответственный менеджер</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
    </>
  )
}

/** Закрытые запросы бухгалтера — то же + «Дата подтверждения». */
function ClosedRequestsTableHeader() {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderLabel>LOFT</GridTableHeaderLabel>
      <GridTableHeaderLabel>Зал</GridTableHeaderLabel>
      <GridTableHeaderLabel>Ответственный менеджер</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата подтверждения</GridTableHeaderLabel>
      <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
    </>
  )
}
