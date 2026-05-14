import { useLocation, useParams } from 'react-router-dom'

import {
  getProjectDetailById,
  mockProjectDetail,
  type ProjectBackOrigin,
} from '@/entities/project'
import { useBreadcrumb } from '@/shared/hooks/use-breadcrumb'
import { ProjectDetail } from '@/widgets/project-detail'

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

  const project = (id && getProjectDetailById(id)) || mockProjectDetail
  const back = isBackOrigin(location.state) ? location.state : DEFAULT_BACK

  useBreadcrumb([
    { label: back.label, to: back.to },
    { label: project.id },
  ])

  return <ProjectDetail project={project} />
}
