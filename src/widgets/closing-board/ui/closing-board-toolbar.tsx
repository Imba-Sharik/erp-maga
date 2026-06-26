import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'
import { ProjectsBoardToolbar } from '@/features/kanban-board'

import type { ProjectsTableColumnView } from '@/widgets/projects-table/lib/economics-columns'
import { ClosingViewToggle, type ClosingViewMode } from './closing-view-toggle'

export type ClosingColumnView = Extract<
  ProjectsTableColumnView,
  'closing-general' | 'closing-economics'
>

const COLUMN_VIEW_OPTIONS: { value: ClosingColumnView; label: string }[] = [
  { value: 'closing-general', label: 'Общие данные' },
  { value: 'closing-economics', label: 'Данные экономики' },
]

const COLUMN_VIEW_TRIGGER =
  'h-10! min-w-0 flex-1 rounded-[10px] border-border-strong bg-card text-xs @3xl:w-55 @3xl:flex-none @3xl:text-sm'

interface ClosingBoardToolbarKanbanProps {
  archiveMode: false
  search: string
  sort: string
  city: string | null
  hall: string | null
  loft: string | null
  plumEventStatus: string[]
  viewMode: ClosingViewMode
  onChangeSearch: (value: string) => void
  onChangeSort: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
  onChangePlumEventStatus: (values: string[]) => void
  onViewModeChange: (value: ClosingViewMode) => void
  onToggleArchive: (value: boolean) => void
}

interface ClosingBoardToolbarArchiveProps {
  archiveMode: true
  search: string
  columnView: ClosingColumnView
  onChangeSearch: (value: string) => void
  onColumnViewChange: (value: ClosingColumnView) => void
  onToggleArchive: (value: boolean) => void
}

type ClosingBoardToolbarProps = ClosingBoardToolbarKanbanProps | ClosingBoardToolbarArchiveProps

export function ClosingBoardToolbar(props: ClosingBoardToolbarProps) {
  if (!props.archiveMode) {
    return (
      <div className="@container flex min-w-0 shrink-0 flex-col gap-2.5 @[1700px]:flex-row @[1700px]:items-center @[1700px]:justify-between @[1700px]:gap-4">
        <div className="flex min-w-0 flex-col gap-2.5 @[1700px]:min-w-0 @[1700px]:flex-1 @[1700px]:flex-row @[1700px]:items-center @[1700px]:gap-3">
          <ProjectsBoardToolbar
            filtersAlign="start"
            search={props.search}
            sort={props.sort}
            city={props.city}
            hall={props.hall}
            loft={props.loft}
            plumEventStatus={props.plumEventStatus}
            onChangeSearch={props.onChangeSearch}
            onChangeSort={props.onChangeSort}
            onChangeCity={props.onChangeCity}
            onChangeHall={props.onChangeHall}
            onChangeLoft={props.onChangeLoft}
            onChangePlumEventStatus={props.onChangePlumEventStatus}
          />
          {/* Мобила: тогл слева + свитч архива справа в одной строке.
              Десктоп: обёртка растворяется (contents) — тогл встаёт к фильтрам,
              свитч архива уходит в правый край тулбара. */}
          <div className="flex items-center justify-between gap-3 @[1700px]:contents">
            <ClosingViewToggle value={props.viewMode} onChange={props.onViewModeChange} />
            <ToggleSwitch
              label="Архивные проекты"
              checked={false}
              onChange={props.onToggleArchive}
              className="text-xs @[1700px]:hidden"
            />
          </div>
        </div>
        <ToggleSwitch
          label="Архивные проекты"
          checked={false}
          onChange={props.onToggleArchive}
          className="hidden text-sm @[1700px]:flex"
        />
      </div>
    )
  }

  return (
    <div className="@container flex shrink-0 flex-col gap-2.5 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-4">
      <div className="flex w-full flex-row items-center gap-2 @3xl:gap-3">
        <div className="relative min-w-0 flex-1 @3xl:w-75 @3xl:flex-none">
          <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2 @3xl:left-3 @3xl:size-4" />
          <Input
            type="search"
            placeholder="Поиск проектов"
            value={props.search}
            onChange={(e) => props.onChangeSearch(e.target.value)}
            className="border-border-strong placeholder:text-muted-foreground bg-card h-10 rounded-[10px] pr-1.5 pl-7 text-xs placeholder:text-xs @3xl:pr-3 @3xl:pl-9 @3xl:text-sm @3xl:placeholder:text-sm"
          />
        </div>

        <Select
          value={props.columnView}
          onValueChange={(v) => props.onColumnViewChange(v as ClosingColumnView)}
        >
          <SelectTrigger className={COLUMN_VIEW_TRIGGER}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLUMN_VIEW_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ToggleSwitch
        label="Архивные проекты"
        checked={true}
        onChange={props.onToggleArchive}
        className="self-end text-xs @3xl:self-auto @3xl:text-sm"
      />
    </div>
  )
}
