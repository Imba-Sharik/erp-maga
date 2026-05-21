import type { Project as ApiProject } from '@/shared/api/generated/types/Project'

import type { Project } from '../model/types'
import { projectStageToApi } from './project-stage-api'

/** Минимальная проекция UI-проекта для patch React Query кэшей списков. */
export function projectToApiListRow(project: Project): ApiProject {
  return {
    id: Number(project.id),
    stage: projectStageToApi(project.stage),
    event_date: project.date,
    plum_event_id: `ui-${project.id}`,
  } as ApiProject
}
