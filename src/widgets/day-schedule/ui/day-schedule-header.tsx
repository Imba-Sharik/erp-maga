import { pluralProjects } from '@/entities/project'
import { pluralizeRu } from '@/shared/lib/plural-ru'

interface DayScheduleHeaderProps {
  projectsCount: number
  daysSelectedCount: number
}

function buildSubtitle(projectsCount: number, daysSelectedCount: number): string {
  if (daysSelectedCount === 1)
    return `${projectsCount} ${pluralProjects(projectsCount)} в этот день`
  const days = pluralizeRu(daysSelectedCount, ['день', 'дня', 'дней'])
  return `${projectsCount} ${pluralProjects(projectsCount)} за ${daysSelectedCount} ${days}`
}

export function DayScheduleHeader({ projectsCount, daysSelectedCount }: DayScheduleHeaderProps) {
  const subtitle = daysSelectedCount > 0 ? buildSubtitle(projectsCount, daysSelectedCount) : null

  return (
    <div className="flex h-10 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-heading text-foreground leading-none font-bold">Расписание</h2>
      {subtitle && <span className="text-muted-foreground text-sm">{subtitle}</span>}
    </div>
  )
}
