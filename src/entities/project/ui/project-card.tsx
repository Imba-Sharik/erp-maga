import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/ui/card'
import type { Project, ProjectBackOrigin } from '../model/types'
import { ProjectStatusBadge } from './project-status-badge'

interface ProjectCardProps {
  project: Project
  backOrigin?: ProjectBackOrigin
}

export function ProjectCard({ project, backOrigin }: ProjectCardProps) {
  const navigate = useNavigate()
  const goToDetail = () => navigate(`/projects/${project.id}`, { state: backOrigin })

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
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="text-xs text-[#ACACAC]">
        {project.loft} · {project.hall} · {project.manager}
      </p>
      <p className="text-xs text-[#ACACAC]">Тип мероприятия: {project.type}</p>
      <p className="text-xs text-[#ACACAC]">Компания: {project.company}</p>
      <p className="text-xs text-[#ACACAC]">
        Телефон: <span className="text-funnel-preproject">{project.phone}</span>
      </p>
    </Card>
  )
}
