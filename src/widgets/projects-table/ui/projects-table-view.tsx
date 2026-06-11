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
import type { ManagerSelectOption } from '@/entities/manager'
import { useChangeProjectManager } from '@/features/change-project-manager'
import type { ColumnFilterKey, ColumnFilters } from '../lib/filter-projects-table'
import {
  getTableGridTemplate,
  getTableMinWidth,
  resolveTableWithActions,
  TABLE_COLUMN_COUNT,
} from '../lib/table-columns'
import {
  HEADER_FILTER_TRIGGER,
  TableHeaderHallFilter,
  TableHeaderLoftFilter,
  TableHeaderManagerFilter,
  TableHeaderPlumStatusFilter,
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
  managerFilterOptions: SelectOption[]
  directoryOptions: ManagerSelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
  onPlumEventStatusChange: (values: string[]) => void
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  backOrigin?: ProjectBackOrigin
  renderRowAction?: (project: Project) => ReactNode
  managerEditable?: boolean
}

export function ProjectsTableView({
  projects,
  columnView,
  columnFilters,
  managerFilterOptions,
  directoryOptions,
  managersSelectLoading = false,
  managersSelectError = false,
  onColumnFilterChange,
  onPlumEventStatusChange,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  backOrigin = DEFAULT_BACK_ORIGIN,
  renderRowAction,
  managerEditable = true,
}: ProjectsTableViewProps) {
  const withActions = resolveTableWithActions(columnView, renderRowAction)
  const gridTemplate = getTableGridTemplate(columnView, { withActions })
  const minWidth = getTableMinWidth(columnView, { withActions })
  const skeletonColumnCount = TABLE_COLUMN_COUNT[columnView] + (withActions ? 1 : 0)
  const [editingManagerProjectId, setEditingManagerProjectId] = useState<string | null>(null)

  const { submit: assignManager, isPending: isAssigningManager } = useChangeProjectManager({
    onSuccess: () => setEditingManagerProjectId(null),
  })

  const handleStartEditManager = useCallback((projectId: string) => {
    setEditingManagerProjectId(projectId)
  }, [])

  const handleCancelEditManager = useCallback(() => {
    setEditingManagerProjectId(null)
  }, [])

  const handleAssignManager = useCallback(
    (projectId: string, managerId: string) => {
      assignManager({ projectId, managerId })
    },
    [assignManager],
  )

  const header =
    columnView === 'requests' ? (
      <RequestsTableHeader
        columnFilters={columnFilters}
        onPlumEventStatusChange={onPlumEventStatusChange}
      />
    ) : columnView === 'closed-requests' ? (
      <ClosedRequestsTableHeader
        columnFilters={columnFilters}
        onPlumEventStatusChange={onPlumEventStatusChange}
      />
    ) : columnView === 'general' ? (
      <GeneralTableHeader
        columnFilters={columnFilters}
        managerFilterOptions={managerFilterOptions}
        managersSelectLoading={managersSelectLoading}
        managersSelectError={managersSelectError}
        onColumnFilterChange={onColumnFilterChange}
        onPlumEventStatusChange={onPlumEventStatusChange}
        withActions={withActions}
      />
    ) : columnView === 'economics' ? (
      <EconomicsTableHeader
        columnFilters={columnFilters}
        managerFilterOptions={managerFilterOptions}
        managersSelectLoading={managersSelectLoading}
        managersSelectError={managersSelectError}
        onColumnFilterChange={onColumnFilterChange}
        onPlumEventStatusChange={onPlumEventStatusChange}
        withActions={withActions}
      />
    ) : columnView === 'closing-active' ? (
      <ClosingActiveTableHeader
        columnFilters={columnFilters}
        onPlumEventStatusChange={onPlumEventStatusChange}
      />
    ) : columnView === 'closing-general' ? (
      <ClosingGeneralTableHeader
        columnFilters={columnFilters}
        managerFilterOptions={managerFilterOptions}
        managersSelectLoading={managersSelectLoading}
        managersSelectError={managersSelectError}
        onColumnFilterChange={onColumnFilterChange}
        withActions={withActions}
      />
    ) : columnView === 'closing-economics' ? (
      <ClosingEconomicsTableHeader
        columnFilters={columnFilters}
        managerFilterOptions={managerFilterOptions}
        managersSelectLoading={managersSelectLoading}
        managersSelectError={managersSelectError}
        onColumnFilterChange={onColumnFilterChange}
        withActions={withActions}
      />
    ) : (
      <OutsideMagTableHeader
        columnFilters={columnFilters}
        managerFilterOptions={managerFilterOptions}
        managersSelectLoading={managersSelectLoading}
        managersSelectError={managersSelectError}
        onColumnFilterChange={onColumnFilterChange}
        onPlumEventStatusChange={onPlumEventStatusChange}
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
      skeletonColumnCount={skeletonColumnCount}
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
          directoryOptions={directoryOptions}
          managerEditable={managerEditable}
          isEditingManager={editingManagerProjectId === project.id}
          onStartEditManager={() => handleStartEditManager(project.id)}
          onAssignManager={(managerId) => handleAssignManager(project.id, managerId)}
          onCancelEditManager={handleCancelEditManager}
          assignDisabled={isAssigningManager}
        />
      ))}
    </GridTableView>
  )
}

function GeneralTableHeader({
  columnFilters,
  managerFilterOptions,
  managersSelectLoading,
  managersSelectError,
  onColumnFilterChange,
  onPlumEventStatusChange,
  withActions,
}: {
  columnFilters: ColumnFilters
  managerFilterOptions: SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
  onPlumEventStatusChange: (values: string[]) => void
  withActions: boolean
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
          managerOptions={managerFilterOptions}
          managerOptionsLoading={managersSelectLoading}
          managerOptionsError={managersSelectError}
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
      <GridTableHeaderCell>
        <TableHeaderPlumStatusFilter
          values={columnFilters.plumEventStatus}
          onChange={onPlumEventStatusChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Телефон</GridTableHeaderLabel>
      <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
      {withActions ? <GridTableHeaderCell aria-hidden /> : null}
    </>
  )
}

type ManagerHeaderProps = {
  columnFilters: ColumnFilters
  managerFilterOptions: SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
  withActions?: boolean
}

type PlumStatusHeaderProps = {
  columnFilters: ColumnFilters
  onPlumEventStatusChange: (values: string[]) => void
}

function OutsideMagTableHeader({
  columnFilters,
  managerFilterOptions,
  managersSelectLoading,
  managersSelectError,
  onColumnFilterChange,
  onPlumEventStatusChange,
}: ManagerHeaderProps & PlumStatusHeaderProps) {
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
          managerOptions={managerFilterOptions}
          managerOptionsLoading={managersSelectLoading}
          managerOptionsError={managersSelectError}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Крайний этап</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderPlumStatusFilter
          values={columnFilters.plumEventStatus}
          onChange={onPlumEventStatusChange}
        />
      </GridTableHeaderCell>
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
  managerFilterOptions,
  managersSelectLoading,
  managersSelectError,
  onColumnFilterChange,
  onPlumEventStatusChange,
  withActions,
}: ManagerHeaderProps & PlumStatusHeaderProps) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerFilterOptions}
          managerOptionsLoading={managersSelectLoading}
          managerOptionsError={managersSelectError}
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
      <GridTableHeaderCell>
        <TableHeaderPlumStatusFilter
          values={columnFilters.plumEventStatus}
          onChange={onPlumEventStatusChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Сумма продаж</GridTableHeaderLabel>
      <GridTableHeaderLabel>Чистая прибыль</GridTableHeaderLabel>
      <GridTableHeaderLabel>Итоговый бонус</GridTableHeaderLabel>
      {withActions ? <GridTableHeaderCell aria-hidden /> : null}
    </>
  )
}

/** Активное закрытие (табличный вид) — фильтр по статусу Plum в шапке. */
function ClosingActiveTableHeader({
  columnFilters,
  onPlumEventStatusChange,
}: PlumStatusHeaderProps) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderLabel>Зал</GridTableHeaderLabel>
      <GridTableHeaderLabel>LOFT</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderPlumStatusFilter
          values={columnFilters.plumEventStatus}
          onChange={onPlumEventStatusChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Менеджер</GridTableHeaderLabel>
      <GridTableHeaderLabel>Тип мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Телефон</GridTableHeaderLabel>
    </>
  )
}

function ClosingGeneralTableHeader({
  columnFilters,
  managerFilterOptions,
  managersSelectLoading,
  managersSelectError,
  onColumnFilterChange,
  withActions,
}: ManagerHeaderProps) {
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
          managerOptions={managerFilterOptions}
          managerOptionsLoading={managersSelectLoading}
          managerOptionsError={managersSelectError}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Телефон</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата архивации</GridTableHeaderLabel>
      {withActions ? <GridTableHeaderCell aria-hidden /> : null}
    </>
  )
}

function ClosingEconomicsTableHeader({
  columnFilters,
  managerFilterOptions,
  managersSelectLoading,
  managersSelectError,
  onColumnFilterChange,
  withActions,
}: ManagerHeaderProps) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderManagerFilter
          columnFilters={columnFilters}
          managerOptions={managerFilterOptions}
          managerOptionsLoading={managersSelectLoading}
          managerOptionsError={managersSelectError}
          onColumnFilterChange={onColumnFilterChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Сумма продаж</GridTableHeaderLabel>
      <GridTableHeaderLabel>Чистая прибыль</GridTableHeaderLabel>
      <GridTableHeaderLabel>Итоговый бонус</GridTableHeaderLabel>
      {withActions ? <GridTableHeaderCell aria-hidden /> : null}
    </>
  )
}

/** Запросы бухгалтера — фильтр по статусу Plum в шапке. */
function RequestsTableHeader({ columnFilters, onPlumEventStatusChange }: PlumStatusHeaderProps) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderLabel>LOFT</GridTableHeaderLabel>
      <GridTableHeaderLabel>Зал</GridTableHeaderLabel>
      <GridTableHeaderLabel>Ответственный менеджер</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderPlumStatusFilter
          values={columnFilters.plumEventStatus}
          onChange={onPlumEventStatusChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
    </>
  )
}

/** Закрытые запросы бухгалтера — то же + «Дата подтверждения». */
function ClosedRequestsTableHeader({
  columnFilters,
  onPlumEventStatusChange,
}: PlumStatusHeaderProps) {
  return (
    <>
      <GridTableHeaderLabel>Название проекта</GridTableHeaderLabel>
      <GridTableHeaderLabel>LOFT</GridTableHeaderLabel>
      <GridTableHeaderLabel>Зал</GridTableHeaderLabel>
      <GridTableHeaderLabel>Ответственный менеджер</GridTableHeaderLabel>
      <GridTableHeaderCell>
        <TableHeaderPlumStatusFilter
          values={columnFilters.plumEventStatus}
          onChange={onPlumEventStatusChange}
        />
      </GridTableHeaderCell>
      <GridTableHeaderLabel>Дата мероприятия</GridTableHeaderLabel>
      <GridTableHeaderLabel>Компания</GridTableHeaderLabel>
      <GridTableHeaderLabel>Дата подтверждения</GridTableHeaderLabel>
      <GridTableHeaderLabel>Появление в системе</GridTableHeaderLabel>
    </>
  )
}
