import { pluralProjects, type ProjectsByDay } from '@/entities/project'
import { CalendarGrid } from './calendar-grid'
import { CalendarToolbar } from './calendar-toolbar'

interface ProjectCalendarProps {
  visibleMonth: Date
  selectedDate: Date
  today: Date
  projectsByDay: ProjectsByDay
  loft: string | null
  hall: string | null
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
  onChangeLoft: (loft: string) => void
  onChangeHall: (hall: string) => void
  totalThisMonth: number
}

export function ProjectCalendar({
  visibleMonth,
  selectedDate,
  today,
  projectsByDay,
  loft,
  hall,
  onChangeMonth,
  onSelectDate,
  onChangeLoft,
  onChangeHall,
  totalThisMonth,
}: ProjectCalendarProps) {
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
        selectedDate={selectedDate}
        today={today}
        projectsByDay={projectsByDay}
        onSelectDate={onSelectDate}
      />
      <p className="text-right text-sm text-[#ACACAC]">
        {pluralProjects(totalThisMonth)} в этом месяце
      </p>
    </div>
  )
}
