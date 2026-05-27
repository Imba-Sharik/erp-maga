import { Search } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ToggleSwitch } from '@/shared/ui/toggle-switch'

import type { ProjectsTableColumnView } from '../lib/economics-columns'

const COLUMN_VIEW_OPTIONS: { value: ProjectsTableColumnView; label: string }[] = [
  { value: 'general', label: 'Общие данные' },
  { value: 'economics', label: 'Данные экономики' },
]

const COLUMN_VIEW_TRIGGER =
  'h-10! w-full max-w-50 flex-1 rounded-[10px] border-[#B1B1B1] bg-white text-xs @3xl:w-55 @3xl:max-w-none @3xl:flex-none @3xl:text-sm'

interface ProjectsTableToolbarProps {
  search: string
  pendingOnly: boolean
  columnView: ProjectsTableColumnView
  onChangeSearch: (value: string) => void
  onTogglePending: (value: boolean) => void
  onColumnViewChange: (value: ProjectsTableColumnView) => void
  onAddProject?: () => void
}

export function ProjectsTableToolbar({
  search,
  pendingOnly,
  columnView,
  onChangeSearch,
  onTogglePending,
  onColumnViewChange,
  onAddProject,
}: ProjectsTableToolbarProps) {
  return (
    <div className="@container flex shrink-0 flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-4">
      <div className="flex w-full flex-col gap-2.5 @3xl:flex-row @3xl:items-center @3xl:gap-3">
        <div className="flex items-center gap-2 @3xl:w-75">
          {onAddProject && (
            <Button
              type="button"
              onClick={onAddProject}
              className="h-10 shrink-0 rounded-[10px] bg-black px-2 text-xs text-white hover:bg-black/90 @3xl:hidden"
            >
              Добавить проект
            </Button>
          )}
          <div className="relative min-w-0 max-w-50 flex-1 @3xl:max-w-none">
            <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-[#ACACAC] @3xl:left-3 @3xl:size-4" />
            <Input
              type="search"
              placeholder="Поиск проектов"
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-7 pr-1.5 text-xs placeholder:text-xs placeholder:text-[#ACACAC] @3xl:pl-9 @3xl:pr-3 @3xl:text-sm @3xl:placeholder:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 @3xl:gap-0">
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
          <ToggleSwitch
            label="Ожидают обработки"
            checked={pendingOnly}
            onChange={onTogglePending}
            className="shrink flex-wrap gap-2 text-xs @3xl:hidden"
          />
        </div>
      </div>

      <ToggleSwitch
        label="Ожидают обработки"
        checked={pendingOnly}
        onChange={onTogglePending}
        className="hidden @3xl:flex"
      />
    </div>
  )
}
