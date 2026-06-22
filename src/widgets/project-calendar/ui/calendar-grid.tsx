import { ProjectCountBadge, type ProjectsByDay } from '@/entities/project'
import { MonthCalendarGrid, type PaintMode } from '@/shared/ui/month-calendar'

interface CalendarGridProps {
  visibleMonth: Date
  selectedKeys: ReadonlySet<string>
  today: Date
  projectsByDay: ProjectsByDay
  onToggleDate: (date: Date) => void
  onPaintDates: (keys: string[], mode: PaintMode) => void
  isLoading?: boolean
}

function countsFromProjectsByDay(projectsByDay: ProjectsByDay): Map<string, number> {
  const counts = new Map<string, number>()
  for (const [key, projects] of projectsByDay) {
    counts.set(key, projects.length)
  }
  return counts
}

export function CalendarGrid({
  visibleMonth,
  selectedKeys,
  today,
  projectsByDay,
  onToggleDate,
  onPaintDates,
  isLoading = false,
}: CalendarGridProps) {
  return (
    <MonthCalendarGrid
      visibleMonth={visibleMonth}
      selectedKeys={selectedKeys}
      today={today}
      countsByDay={countsFromProjectsByDay(projectsByDay)}
      onToggleDate={onToggleDate}
      onPaintDates={onPaintDates}
      renderBadge={(count) => <ProjectCountBadge count={count} />}
      isLoading={isLoading}
      enablePaintSelect
    />
  )
}
