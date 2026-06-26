import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/ui/card'
import { projectDetailPath } from '../lib/project-detail-path'
import type { Project, ProjectBackOrigin } from '../model/types'
import { ProjectPlumStatusLine } from './project-plum-status-line'
import { ProjectStageBadge } from './project-stage-badge'
import { ProjectTelegramLink } from './project-telegram-link'

interface ProjectCardProps {
  project: Project
  backOrigin?: ProjectBackOrigin
}

export function ProjectCard({ project, backOrigin }: ProjectCardProps) {
  const navigate = useNavigate()
  const goToDetail = () =>
    navigate(projectDetailPath(project.id, backOrigin), { state: backOrigin })
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  // Лёгкие карточки из /projects/calendar/ приходят со слитой строкой hallLoft и
  // без company/phone/email/type. Скрываем строки, для которых нет данных, чтобы
  // не показывать «  · ` ·» и пустые лейблы.
  const venueLabel = [project.hallLoft || project.loft, project.hall, project.manager]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goToDetail()
        }
      }}
      className="focus-visible:ring-ring/50 border-border-medium bg-surface-subtle hover:border-border-strong cursor-pointer gap-1.5 p-2.5 shadow-none transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">{project.title}</h3>
        <ProjectStageBadge stage={project.stage} />
      </div>
      {venueLabel && <p className="text-muted-foreground text-xs">{venueLabel}</p>}
      {project.type && (
        <p className="text-muted-foreground text-xs">Тип мероприятия: {project.type}</p>
      )}
      {project.company && (
        <p className="text-muted-foreground text-xs">Компания: {project.company}</p>
      )}
      {project.phone && (
        <p className="text-muted-foreground text-xs">
          Телефон: <span className="text-funnel-preproject">{project.phone}</span>
        </p>
      )}
      <ProjectPlumStatusLine project={project} />
      {project.phone && <ProjectTelegramLink phone={project.phone} onClick={stop} />}
    </Card>
  )
}
