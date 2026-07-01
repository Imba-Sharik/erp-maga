import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'
import { ViewModeToggle, type ViewMode } from '@/shared/ui/view-mode-toggle'
import { ProjectsBoardToolbar } from '@/features/kanban-board'

import type { ProjectsTableColumnView } from '@/widgets/projects-table/lib/economics-columns'

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
  viewMode: ViewMode
  onChangeSearch: (value: string) => void
  onChangeSort: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
  onChangePlumEventStatus: (values: string[]) => void
  onViewModeChange: (value: ViewMode) => void
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
      <div className="@container">
        {/* Поиск, фильтры, тогл и свитч архива — единый переносящийся блок.
            Свитч архива уходит в конец блока и прижимается вправо (ml-auto). */}
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
          viewModeToggle={
            <ViewModeToggle value={props.viewMode} onChange={props.onViewModeChange} />
          }
          trailing={
            <ToggleSwitch
              label="Архивные проекты"
              checked={false}
              onChange={props.onToggleArchive}
              className="shrink-0 text-xs @4xl:ml-auto @4xl:text-sm"
            />
          }
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
