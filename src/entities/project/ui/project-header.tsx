import type { ReactNode } from 'react'

import type { ProjectDetail, ProjectStage } from '../model/types'
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

interface ProjectHeaderProps {
  project: ProjectDetail
  currentStage?: ProjectStage
  /** Слот названия. Виджет подставляет редактируемый заголовок (ERP-231); по умолчанию — статичный h1. */
  titleSlot?: ReactNode
}

export function ProjectHeader({ project, currentStage, titleSlot }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 @sm:flex-row @sm:items-center @sm:justify-between @sm:gap-4">
        {titleSlot ?? <h1 className="text-foreground text-2xl font-bold">{project.title}</h1>}
        <PlumLink href={project.plumCardUrl} />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Текущий этап</span>
          <ProjectStageBadge stage={currentStage ?? project.stage} />
        </div>
        <span className="text-foreground-soft">Менеджер: {project.manager}</span>
        <span className="text-muted-foreground">
          Заведено в систему: {formatEnteredAt(project.enteredSystemAt)}
        </span>
      </div>
    </div>
  )
}
