import type { ProjectStage } from '@/entities/project'

import type { ProjectActivityEvent } from '../model/types'
import { buildStageActionMessage } from './stage-action-message'
import { getStagePrimaryRole } from './stage-actor'

/**
 * Минимальная форма записи этапа, нужная для сборки лога — берёт только
 * метаданные перехода. Совместима и с `flow.records`, и с `project.stageSnapshots`.
 */
export interface ActivityStageEntry {
  enteredAt?: string
  enteredBy?: string
}

export type ActivityStageRecords = Partial<Record<ProjectStage, ActivityStageEntry>>

interface BuildActivityFeedInput {
  records: ActivityStageRecords
  /** Имя менеджера проекта — подставляется в фразу про утверждение бонуса. */
  projectManager?: string
}

/** События лога, новые сверху. */
export function buildActivityFeed({
  records,
  projectManager,
}: BuildActivityFeedInput): ProjectActivityEvent[] {
  const events: ProjectActivityEvent[] = []

  const entries = Object.entries(records) as [ProjectStage, ActivityStageEntry | undefined][]
  for (const [stage, record] of entries) {
    if (!record?.enteredAt || !record.enteredBy) continue
    const role = getStagePrimaryRole(stage)
    if (!role) continue
    const action = buildStageActionMessage(stage, { managerName: projectManager })
    if (!action) continue

    events.push({
      id: `stage:${stage}`,
      actorRole: role,
      actorName: record.enteredBy,
      action,
      at: record.enteredAt,
    })
  }

  return events.sort((a, b) => (a.at < b.at ? 1 : -1))
}
