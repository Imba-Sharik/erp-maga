import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/ui/card'
import type { Project, ProjectBackOrigin } from '../model/types'
import { ProjectStageBadge } from './project-stage-badge'
import { ProjectTelegramLink } from './project-telegram-link'

interface ProjectCardProps {
  project: Project
  backOrigin?: ProjectBackOrigin
}

export function ProjectCard({ project, backOrigin }: ProjectCardProps) {
  const navigate = useNavigate()
  const goToDetail = () => navigate(`/projects/${project.id}`, { state: backOrigin })
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  // У лёгких календарных карточек нет company/phone/email/type — скрываем
  // строки без данных, чтобы не было «  · ` ·» и пустых лейблов. У части
  // залов лофта нет — тогда loft пустой, и в строку он не попадёт.
  const venueLabel = [project.loft, project.hall, project.manager]
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
      className="focus-visible:ring-ring/50 cursor-pointer gap-1.5 border-[#D3D3D3] bg-[#F9F9F9] p-2.5 shadow-none transition-colors hover:border-[#B1B1B1] focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1B1A17]">{project.title}</h3>
        <ProjectStageBadge stage={project.stage} />
      </div>
      {venueLabel && <p className="text-xs text-[#ACACAC]">{venueLabel}</p>}
      {project.type && <p className="text-xs text-[#ACACAC]">Тип мероприятия: {project.type}</p>}
      {project.company && <p className="text-xs text-[#ACACAC]">Компания: {project.company}</p>}
      {project.phone && (
        <p className="text-xs text-[#ACACAC]">
          Телефон: <span className="text-funnel-preproject">{project.phone}</span>
        </p>
      )}
      {project.phone && <ProjectTelegramLink phone={project.phone} onClick={stop} />}
    </Card>
  )
}
