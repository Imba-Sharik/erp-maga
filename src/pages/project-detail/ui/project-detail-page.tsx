import { useLocation, useParams } from 'react-router-dom'
import { mockProjects, type ProjectBackOrigin } from '@/entities/project'
import { useBreadcrumb } from '@/shared/hooks/use-breadcrumb'

const DEFAULT_BACK: ProjectBackOrigin = { to: '/projects', label: 'Все проекты' }

function isBackOrigin(state: unknown): state is ProjectBackOrigin {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof (state as ProjectBackOrigin).to === 'string' &&
    typeof (state as ProjectBackOrigin).label === 'string'
  )
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const project = mockProjects.find((p) => p.id === id)

  const back = isBackOrigin(location.state) ? location.state : DEFAULT_BACK

  useBreadcrumb([
    { label: back.label, to: back.to },
    { label: project?.title ?? id ?? 'Проект' },
  ])

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#ACACAC]">Проект не найден</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#1B1A17]">{project.title}</h1>
      <p className="text-sm text-[#ACACAC]">
        Страница детального просмотра проекта в разработке.
      </p>
    </div>
  )
}
