import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ProjectCard, type Project } from '@/entities/project'
import { Card } from '@/shared/ui/card'
import { DayScheduleHeader } from './day-schedule-header'

interface DayScheduleProps {
  selectedDate: Date
  projects: Project[]
}

export function DaySchedule({ selectedDate, projects }: DayScheduleProps) {
  const dateLabel = format(selectedDate, 'd MMMM yyyy', { locale: ru })

  return (
    <div className="flex flex-col gap-4">
      <DayScheduleHeader count={projects.length} />
      <Card className="gap-2.5 border-[#B1B1B1] p-2.5 shadow-none">
        <div className="inline-flex h-10 w-fit items-center rounded-[10px] border border-[#B1B1B1] bg-white px-3.5 text-sm font-semibold text-[#1B1A17]">
          {dateLabel}
        </div>
        {projects.length === 0 ? (
          <p className="px-1 py-4 text-sm text-[#ACACAC]">На этот день проектов нет</p>
        ) : (
          projects.map((p) => <ProjectCard key={p.id} project={p} />)
        )}
      </Card>
    </div>
  )
}
