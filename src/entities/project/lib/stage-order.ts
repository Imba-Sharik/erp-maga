import type { ProjectStage } from '../model/types'

import { ALL_STAGE_ORDER } from './stages'

const STAGE_INDEX = new Map<ProjectStage, number>(
  ALL_STAGE_ORDER.map((stage, index) => [stage, index]),
)

/** Текущий этап не раньше `threshold` в общем порядке воронки. */
export function isStageAtLeast(stage: ProjectStage, threshold: ProjectStage): boolean {
  const current = STAGE_INDEX.get(stage)
  const min = STAGE_INDEX.get(threshold)
  if (current === undefined || min === undefined) return false
  return current >= min
}

/** Проект дошёл до финансовых этапов (`ready_to_event` и далее). */
export function hasReachedFinanceStages(project: {
  stage: ProjectStage
  lastActiveStage?: ProjectStage
}): boolean {
  if (isStageAtLeast(project.stage, 'ready_to_event')) return true
  return project.lastActiveStage != null && isStageAtLeast(project.lastActiveStage, 'ready_to_event')
}
