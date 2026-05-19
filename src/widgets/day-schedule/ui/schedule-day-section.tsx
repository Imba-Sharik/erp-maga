import { memo } from 'react'
import { X } from 'lucide-react'
import { ProjectCard, type Project, type ProjectBackOrigin } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import { DatePill } from './date-pill'

const CALENDAR_BACK_ORIGIN: ProjectBackOrigin = {
  to: '/calendar',
  label: 'Календарь',
}

interface ScheduleDaySectionProps {
  date: Date
  projects: Project[]
  onRemoveSelectedDay: (date: Date) => void
}

export const ScheduleDaySection = memo(function ScheduleDaySection({
  date,
  projects,
  onRemoveSelectedDay,
}: ScheduleDaySectionProps) {
  return (
    <section className="border-b border-[#E8E8E8] pb-5 last:border-b-0 last:pb-0">
      <div className="mb-2.5 flex items-center gap-1.5">
        <DatePill date={date} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 cursor-pointer text-[#ACACAC] hover:text-[#1B1A17]"
          aria-label="Снять выделение с этого дня"
          onClick={() => onRemoveSelectedDay(date)}
        >
          <X />
        </Button>
      </div>
      {projects.length === 0 ? (
        <p className="px-1 py-2 text-sm text-[#ACACAC]">На этот день проектов нет</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} backOrigin={CALENDAR_BACK_ORIGIN} />
          ))}
        </div>
      )}
    </section>
  )
})
