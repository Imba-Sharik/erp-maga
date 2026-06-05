import { useMemo } from 'react'
import { pluralProjects, toDayKey, type ProjectsByDay } from '@/entities/project'
import type { SelectOption } from '@/shared/ui/clearable-select'
import type { PaintMode } from '../lib/use-calendar-paint-select'
import { CalendarGrid } from './calendar-grid'
import { CalendarToolbar } from './calendar-toolbar'

interface ProjectCalendarProps {
  projectSearch: string
  onChangeProjectSearch: (value: string) => void
  visibleMonth: Date
  selectedDates: Date[]
  today: Date
  projectsByDay: ProjectsByDay
  loft: string | null
  hall: string | null
  onChangeMonth: (date: Date) => void
  onToggleDate: (date: Date) => void
  onPaintDates: (keys: string[], mode: PaintMode) => void
  onChangeLoft: (loft: string | null) => void
  onChangeHall: (hall: string | null) => void
  showManagerFilter?: boolean
  magManagerId?: string | null
  onChangeMagManager?: (value: string | null) => void
  managerFilterOptions?: readonly SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  totalThisMonth: number
  isLoading?: boolean
  isFetching?: boolean
}

export function ProjectCalendar({
  projectSearch,
  onChangeProjectSearch,
  visibleMonth,
  selectedDates,
  today,
  projectsByDay,
  loft,
  hall,
  onChangeMonth,
  onToggleDate,
  onPaintDates,
  onChangeLoft,
  onChangeHall,
  showManagerFilter = false,
  magManagerId = null,
  onChangeMagManager,
  managerFilterOptions = [],
  managersSelectLoading = false,
  managersSelectError = false,
  totalThisMonth,
  isLoading = false,
  isFetching = false,
}: ProjectCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDates.map(toDayKey)),
    [selectedDates],
  )

  return (
    <div className="@container/calendar flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <CalendarToolbar
        projectSearch={projectSearch}
        onChangeProjectSearch={onChangeProjectSearch}
        visibleMonth={visibleMonth}
        onChangeMonth={onChangeMonth}
        loft={loft}
        onChangeLoft={onChangeLoft}
        hall={hall}
        onChangeHall={onChangeHall}
        showManagerFilter={showManagerFilter}
        magManagerId={magManagerId}
        onChangeMagManager={onChangeMagManager}
        managerFilterOptions={managerFilterOptions}
        managersSelectLoading={managersSelectLoading}
        managersSelectError={managersSelectError}
        isFetching={isFetching}
      />
      <div>
        <CalendarGrid
          visibleMonth={visibleMonth}
          selectedKeys={selectedKeys}
          today={today}
          projectsByDay={projectsByDay}
          onToggleDate={onToggleDate}
          onPaintDates={onPaintDates}
          isLoading={isLoading}
        />
        <p className="pt-2 text-right text-xs text-[#ACACAC] sm:pt-4 sm:text-sm">
          {totalThisMonth} {pluralProjects(totalThisMonth)} в этом месяце
        </p>
      </div>
    </div>
  )
}
