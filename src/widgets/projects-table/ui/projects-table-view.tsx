import { useEffect, useRef, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

import {
  ALL_STAGE_LABELS,
  ALL_STAGE_ORDER,
  type Project,
  type ProjectBackOrigin,
} from '@/entities/project'
import { HALL_OPTIONS, LOFT_OPTIONS } from '@/shared/constants/venue-options'
import { Card } from '@/shared/ui/card'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'
import { Skeleton } from '@/shared/ui/skeleton'

import type { ProjectsTableColumnView } from '../lib/economics-columns'
import type { ColumnFilterKey, ColumnFilters } from '../lib/filter-projects-table'
import { getTableGridTemplate, getTableMinWidth, TABLE_COLUMN_COUNT } from '../lib/table-columns'
import { ProjectsTableRow } from './projects-table-row'

const BACK_ORIGIN: ProjectBackOrigin = { to: '/projects', label: 'Все проекты' }

/** Все 12 этапов воронки — фиксированный список для фильтра «Этап проекта». */
const STAGE_OPTIONS: SelectOption[] = ALL_STAGE_ORDER.map((stage) => ({
  value: stage,
  label: ALL_STAGE_LABELS[stage],
}))

const HEADER_FILTER_TRIGGER =
  'h-7 w-full min-w-0 gap-1 rounded-md border-0 bg-[#F6F6F6] px-2.5 text-xs text-[#454545] shadow-none data-placeholder:text-[#454545]'

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
}: ProjectsTableViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const gridTemplate = getTableGridTemplate(columnView)
  const minWidth = getTableMinWidth(columnView)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onLoadMore()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, onLoadMore])

  return (
    <Card className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden border-[#B1B1B1] py-0 shadow-none">
      <div className="min-h-0 flex-1 overflow-auto">
        <div style={{ minWidth }}>
          <div
            className="sticky top-0 z-10 grid items-center border-b border-[#D3D3D3] bg-white"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columnView === 'general' ? (
              <GeneralTableHeader
                columnFilters={columnFilters}
                managerOptions={managerOptions}
                onColumnFilterChange={onColumnFilterChange}
              />
            ) : (
              <EconomicsTableHeader
                columnFilters={columnFilters}
                managerOptions={managerOptions}
                onColumnFilterChange={onColumnFilterChange}
              />
            )}
          </div>

          {isLoading ? (
            <TableSkeleton columnView={columnView} gridTemplate={gridTemplate} />
          ) : isError ? (
            <div className="flex h-40 items-center justify-center px-4 text-sm text-red-600">
              Не удалось загрузить проекты.
            </div>
          ) : projects.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-4 text-sm text-[#ACACAC]">
              Проекты не найдены.
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <ProjectsTableRow
                  key={project.id}
                  project={project}
                  columnView={columnView}
                  backOrigin={BACK_ORIGIN}
                />
              ))}
              {hasNextPage && (
                <div
                  ref={sentinelRef}
                  className="flex h-12 items-center justify-center text-[#ACACAC]"
                >
                  {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
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
      <HeaderLabel>Название проекта</HeaderLabel>
      <HeaderCell>
        <ClearableSelect
          placeholder="LOFT"
          value={columnFilters.loft}
          options={LOFT_OPTIONS}
          onChange={(v) => onColumnFilterChange('loft', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </HeaderCell>
      <HeaderCell>
        <ClearableSelect
          placeholder="Зал"
          value={columnFilters.hall}
          options={HALL_OPTIONS}
          onChange={(v) => onColumnFilterChange('hall', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </HeaderCell>
      <HeaderCell>
        <ClearableSelect
          placeholder="Отв. менеджер"
          value={columnFilters.manager}
          options={managerOptions}
          onChange={(v) => onColumnFilterChange('manager', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </HeaderCell>
      <HeaderCell>
        <ClearableSelect
          placeholder="Этап проекта"
          value={columnFilters.stage}
          options={STAGE_OPTIONS}
          onChange={(v) => onColumnFilterChange('stage', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </HeaderCell>
      <HeaderLabel>Дата мероприятия</HeaderLabel>
      <HeaderLabel>Компания</HeaderLabel>
      <HeaderLabel>Телефон</HeaderLabel>
      <HeaderLabel>Появление в системе</HeaderLabel>
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
      <HeaderLabel>Название проекта</HeaderLabel>
      <HeaderCell>
        <ClearableSelect
          placeholder="Отв. менеджер"
          value={columnFilters.manager}
          options={managerOptions}
          onChange={(v) => onColumnFilterChange('manager', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </HeaderCell>
      <HeaderLabel>Компания</HeaderLabel>
      <HeaderCell>
        <ClearableSelect
          placeholder="Этап проекта"
          value={columnFilters.stage}
          options={STAGE_OPTIONS}
          onChange={(v) => onColumnFilterChange('stage', v)}
          triggerClassName={HEADER_FILTER_TRIGGER}
        />
      </HeaderCell>
      <HeaderLabel>Сумма продаж</HeaderLabel>
      <HeaderLabel>Чистая прибыль</HeaderLabel>
      <HeaderLabel>Итоговый бонус</HeaderLabel>
    </>
  )
}

function HeaderLabel({ children }: { children: ReactNode }) {
  return <div className="min-w-0 truncate px-3 py-3 text-sm text-[#454545]">{children}</div>
}

function HeaderCell({ children }: { children: ReactNode }) {
  return <div className="min-w-0 px-3 py-2">{children}</div>
}

function TableSkeleton({
  columnView,
  gridTemplate,
}: {
  columnView: ProjectsTableColumnView
  gridTemplate: string
}) {
  const colCount = TABLE_COLUMN_COUNT[columnView]

  return (
    <>
      {Array.from({ length: 10 }).map((_, row) => (
        <div
          key={row}
          className="grid items-center border-b border-[#EDEDED]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {Array.from({ length: colCount }).map((__, col) => (
            <div key={col} className="px-3 py-3.5">
              <Skeleton className="h-3.5 w-full max-w-30" />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
