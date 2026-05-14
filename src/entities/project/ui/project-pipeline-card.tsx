import { Link2, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/shared/ui/card'
import type { Project, ProjectBackOrigin } from '../model/types'

interface ProjectPipelineCardProps {
  project: Project
  backOrigin?: ProjectBackOrigin
}

export function ProjectPipelineCard({ project, backOrigin }: ProjectPipelineCardProps) {
  const navigate = useNavigate()
  const goToDetail = () => navigate(`/projects/${project.id}`, { state: backOrigin })
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation()

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
      className="focus-visible:ring-ring/50 cursor-pointer gap-1 border-[#D3D3D3] bg-[#F9F9F9] p-2.5 shadow-none transition-colors hover:border-[#B1B1B1] focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold text-[#454545]">{project.title}</h3>
        <button
          type="button"
          aria-label="Меню проекта"
          onClick={stop}
          className="text-[#454545] hover:opacity-70"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>

      <p className="text-xs text-[#ACACAC]">
        {project.loft} · {project.hall}
      </p>
      <p className="text-xs text-[#ACACAC]">Дата мероприятия: {formatDate(project.date)}</p>
      <p className="text-xs text-[#ACACAC]">Менеджер MAG: {project.manager}</p>
      <p className="text-xs text-[#ACACAC]">Тип мероприятия: {project.type}</p>
      <p className="text-xs text-[#ACACAC]">Компания: {project.company}</p>
      <p className="text-xs text-[#ACACAC]">
        Телефон: <span className="text-funnel-preproject">{project.phone}</span>
      </p>
      <p className="text-xs text-[#ACACAC]">
        Email:{' '}
        <a
          href={`mailto:${project.email}`}
          onClick={stop}
          className="text-funnel-preproject underline-offset-2 hover:underline"
        >
          {project.email}
        </a>
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <a
          href={project.plumCardUrl}
          target="_blank"
          rel="noreferrer"
          onClick={stop}
          className="inline-flex items-center gap-1.5 text-xs text-funnel-preproject underline-offset-2 hover:underline"
        >
          <span className="inline-flex size-4 items-center justify-center rounded-[5px] bg-funnel-preproject text-white">
            <Link2 className="size-3" />
          </span>
          Карточка в PLUM
        </a>
        <span className="text-[10px] text-[#ACACAC]">{project.lastUpdate}</span>
      </div>
    </Card>
  )
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
