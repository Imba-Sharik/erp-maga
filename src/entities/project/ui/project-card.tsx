import { Card } from '@/shared/ui/card'
import type { Project } from '../model/types'
import { ProjectStatusBadge } from './project-status-badge'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="gap-1.5 border-[#D3D3D3] bg-[#F9F9F9] p-2.5 shadow-none">
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
