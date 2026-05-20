import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'

import type { ProjectsTableColumnView } from '../lib/economics-columns'

const COLUMN_VIEW_OPTIONS: { value: ProjectsTableColumnView; label: string }[] = [
  { value: 'general', label: 'Общие данные' },
  { value: 'economics', label: 'Данные экономики' },
]

const COLUMN_VIEW_TRIGGER = 'h-10! w-full rounded-[10px] border-[#B1B1B1] bg-white sm:w-55'

interface ProjectsTableToolbarProps {
  search: string
  pendingOnly: boolean
  columnView: ProjectsTableColumnView
  onChangeSearch: (value: string) => void
  onTogglePending: (value: boolean) => void
  onColumnViewChange: (value: ProjectsTableColumnView) => void
}

export function ProjectsTableToolbar({
  search,
  pendingOnly,
  columnView,
  onChangeSearch,
  onTogglePending,
  onColumnViewChange,
}: ProjectsTableToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative w-full sm:w-75">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#ACACAC]" />
          <Input
            type="search"
            placeholder="Поиск проектов"
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-9 placeholder:text-[#ACACAC]"
          />
        </div>

        <Select
          value={columnView}
          onValueChange={(v) => onColumnViewChange(v as ProjectsTableColumnView)}
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

      <ToggleSwitch label="Ожидают обработки" checked={pendingOnly} onChange={onTogglePending} />
    </div>
  )
}
