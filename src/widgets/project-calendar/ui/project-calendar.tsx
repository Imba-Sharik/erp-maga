import { useMemo } from 'react'
import { pluralProjects, toDayKey, type ProjectsByDay } from '@/entities/project'
import { CalendarGrid } from './calendar-grid'
import { CalendarToolbar } from './calendar-toolbar'

interface ProjectCalendarProps {
  visibleMonth: Date
  selectedDates: Date[]
  today: Date
  projectsByDay: ProjectsByDay
  loft: string | null
  hall: string | null
  onChangeMonth: (date: Date) => void
  onToggleDate: (date: Date) => void
  onChangeLoft: (loft: string | null) => void
  onChangeHall: (hall: string | null) => void
  totalThisMonth: number
}

export function ProjectCalendar({
  visibleMonth,
  selectedDates,
  today,
  projectsByDay,
  loft,
  hall,
  onChangeMonth,
  onToggleDate,
  onChangeLoft,
  onChangeHall,
  totalThisMonth,
}: ProjectCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDates.map(toDayKey)),
    [selectedDates],
  )

  return (
    <div className="@container flex flex-col gap-4">
      <CalendarToolbar
        visibleMonth={visibleMonth}
        onChangeMonth={onChangeMonth}
        loft={loft}
        onChangeLoft={onChangeLoft}
        hall={hall}
        onChangeHall={onChangeHall}
      />
      <CalendarGrid
        visibleMonth={visibleMonth}
        selectedKeys={selectedKeys}
        today={today}
        projectsByDay={projectsByDay}
        onToggleDate={onToggleDate}
      />
      <p className="text-right text-sm text-[#ACACAC]">
        {totalThisMonth} {pluralProjects(totalThisMonth)} в этом месяце
      </p>
    </div>
  )
}
