import type { ProjectDetail } from '../model/types'
import { PlumLink } from './plum-link'
import { ProjectStageBadge } from './project-stage-badge'

const META_DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatEnteredAt(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return META_DATE_FORMAT.format(d)
}

export function ProjectHeader({ project }: { project: ProjectDetail }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1B1A17]">{project.title}</h1>
        <PlumLink href={project.plumCardUrl} />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Текущий этап</span>
          <ProjectStageBadge stage={project.stage} />
        </div>
        <span className="text-[#454545]">Менеджер: {project.manager}</span>
        <span className="text-muted-foreground">
          Заведено в систему: {formatEnteredAt(project.enteredSystemAt)}
        </span>
      </div>
    </div>
  )
}
