import { X } from 'lucide-react'
import { ProjectCard, type Project } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import { DatePill } from './date-pill'

interface ScheduleDaySectionProps {
  date: Date
  projects: Project[]
  withDivider?: boolean
  onRemoveSelectedDay: (date: Date) => void
}

export function ScheduleDaySection({
  date,
  projects,
  withDivider,
  onRemoveSelectedDay,
}: ScheduleDaySectionProps) {
  return (
    <section className={withDivider ? 'border-b border-[#E8E8E8] pb-5' : undefined}>
      <div className="mb-2.5 flex items-center gap-1.5">
        <DatePill date={date} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-[#ACACAC] hover:text-[#1B1A17] cursor-pointer"
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
            <ProjectCard
              key={p.id}
              project={p}
              backOrigin={{ to: '/calendar', label: 'Календарь' }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
