import { pluralProjects } from '@/entities/project'
import { pluralizeRu } from '@/shared/lib/plural-ru'

interface DayScheduleHeaderProps {
  projectsCount: number
  daysSelectedCount: number
}

function buildSubtitle(projectsCount: number, daysSelectedCount: number): string {
  if (daysSelectedCount === 0) return 'Выберите дни в календаре'
  if (daysSelectedCount === 1)
    return `${projectsCount} ${pluralProjects(projectsCount)} в этот день`
  const days = pluralizeRu(daysSelectedCount, ['день', 'дня', 'дней'])
  return `${projectsCount} ${pluralProjects(projectsCount)} за ${daysSelectedCount} ${days}`
}

export function DayScheduleHeader({ projectsCount, daysSelectedCount }: DayScheduleHeaderProps) {
  return (
    <div className="flex h-10 flex-col gap-1 items-start sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-heading leading-none font-bold text-[#1B1A17]">Расписание</h2>
      <span className="text-sm text-[#ACACAC]">
        {buildSubtitle(projectsCount, daysSelectedCount)}
      </span>
    </div>
  )
}
