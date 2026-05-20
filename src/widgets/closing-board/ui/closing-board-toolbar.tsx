import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'
import { ProjectsBoardToolbar } from '@/widgets/projects-board/ui/projects-board-toolbar'

import type { ProjectsTableColumnView } from '@/widgets/projects-table/lib/economics-columns'

export type ClosingColumnView = Extract<
  ProjectsTableColumnView,
  'closing-general' | 'closing-economics'
>

const COLUMN_VIEW_OPTIONS: { value: ClosingColumnView; label: string }[] = [
  { value: 'closing-general', label: 'Общие данные' },
  { value: 'closing-economics', label: 'Данные экономики' },
]

const COLUMN_VIEW_TRIGGER = 'h-10! w-full rounded-[10px] border-[#B1B1B1] bg-white sm:w-55'

interface ClosingBoardToolbarKanbanProps {
  archiveMode: false
  search: string
  city: string | null
  hall: string | null
  loft: string | null
  onChangeSearch: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
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
      <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <ProjectsBoardToolbar
          filtersAlign="start"
          search={props.search}
          city={props.city}
          hall={props.hall}
          loft={props.loft}
          onChangeSearch={props.onChangeSearch}
          onChangeCity={props.onChangeCity}
          onChangeHall={props.onChangeHall}
          onChangeLoft={props.onChangeLoft}
        />
        <ToggleSwitch label="Архивные проекты" checked={false} onChange={props.onToggleArchive} />
      </div>
    )
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative w-full sm:w-75">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#ACACAC]" />
          <Input
            type="search"
            placeholder="Поиск проектов"
            value={props.search}
            onChange={(e) => props.onChangeSearch(e.target.value)}
            className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-9 placeholder:text-[#ACACAC]"
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

      <ToggleSwitch label="Архивные проекты" checked={true} onChange={props.onToggleArchive} />
    </div>
  )
}
