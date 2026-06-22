import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  mapBackendProjectDetail,
  resolveProjectBackFromPathname,
  type ProjectBackOrigin,
} from '@/entities/project'
import { useProjectsRetrieve } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { useBreadcrumb } from '@/shared/hooks'
import { ProjectDetail } from '@/widgets/project-detail'

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
  const back = isBackOrigin(location.state)
    ? location.state
    : resolveProjectBackFromPathname(location.pathname)

  const numericId = id ? Number(id) : undefined
  const { data, isLoading, isError } = useProjectsRetrieve(numericId)

  const project = useMemo(() => (data ? mapBackendProjectDetail(data) : null), [data])

  useBreadcrumb([{ label: back.label, to: back.to }, { label: project?.title ?? id ?? '' }])

  if (isLoading) {
    return <p className="text-sm text-[#ACACAC]">Загружаем проект…</p>
  }
  if (isError || !project) {
    return (
      <p className="text-sm text-red-600">
        Не удалось загрузить проект (id {id}). Возможно, его стадия вне воронки MAG.
      </p>
    )
  }

  // key — чтобы при переходе между проектами useStageFlow пересоздавался
  // (свежее состояние этапов + срабатывает сохранение черновика при уходе).
  return <ProjectDetail key={project.id} project={project} />
}
