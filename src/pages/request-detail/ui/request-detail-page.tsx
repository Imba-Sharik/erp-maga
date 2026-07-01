import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  mapBackendProjectDetail,
  resolveRequestBackFromPathname,
  type ProjectBackOrigin,
} from '@/entities/project'
import { useProjectsPipelineRetrieve } from '@/shared/api/generated/hooks/projectsController/useProjectsPipelineRetrieve'
import { useProjectsRetrieve } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { useBreadcrumb } from '@/shared/hooks'
import { RequestDetail } from '@/widgets/request-detail'

function isBackOrigin(state: unknown): state is ProjectBackOrigin {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof (state as ProjectBackOrigin).to === 'string' &&
    typeof (state as ProjectBackOrigin).label === 'string'
  )
}

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const back = isBackOrigin(location.state)
    ? location.state
    : resolveRequestBackFromPathname(location.pathname)

  const numericId = id ? Number(id) : undefined
  const { data, isLoading, isError } = useProjectsRetrieve(numericId)
  // Пер-блочные права правки (`can_edit_*`) приходят отдельным запросом состояния воронки.
  const { data: pipeline } = useProjectsPipelineRetrieve(numericId)

  const project = useMemo(
    () => (data ? mapBackendProjectDetail(data, pipeline) : null),
    [data, pipeline],
  )

  useBreadcrumb([{ label: back.label, to: back.to }, { label: project?.title ?? id ?? '' }])

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Загружаем проект…</p>
  }
  if (isError || !project) {
    return <p className="text-error text-sm">Не удалось загрузить проект (id {id}).</p>
  }

  // key — пересоздать useStageFlow при переходе между проектами.
  return <RequestDetail key={project.id} project={project} />
}
