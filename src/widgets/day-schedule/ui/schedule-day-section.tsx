import { ProjectCard, type Project } from '@/entities/project'
import { DatePill } from './date-pill'

interface ScheduleDaySectionProps {
  date: Date
  projects: Project[]
  withDivider?: boolean
}

export function ScheduleDaySection({ date, projects, withDivider }: ScheduleDaySectionProps) {
  return (
    <section className={withDivider ? 'border-b border-[#E8E8E8] pb-5' : undefined}>
      <DatePill date={date} className="mb-2.5" />
      {projects.length === 0 ? (
        <p className="px-1 py-2 text-sm text-[#ACACAC]">На этот день проектов нет</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  )
}
