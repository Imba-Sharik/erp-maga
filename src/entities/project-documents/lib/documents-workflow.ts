import {
  ALL_STAGE_ORDER,
  type DocumentStatus,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'

import { STAGE_DOCUMENTS } from './stage-document-registry'

const SETTLED_STATUSES: ReadonlySet<DocumentStatus> = new Set(['present', 'not_required'])

export function hasReRequestedStatus(values?: Partial<StageFormData>): boolean {
  if (!values) return false
  return STAGE_DOCUMENTS.some((d) => values[d.statusKey] === 're_requested')
}

/** Все статусы финализированы бухгалтером (нет «запросить повторно»). */
export function isDocumentsStageSettled(values?: Partial<StageFormData>): boolean {
  if (hasReRequestedStatus(values)) return false
  return STAGE_DOCUMENTS.every((d) => {
    const status = values?.[d.statusKey] as DocumentStatus | undefined
    return status !== undefined && SETTLED_STATUSES.has(status)
  })
}

type StageValuesRecord = Partial<
  Record<ProjectStage, { values?: Partial<StageFormData> } | undefined>
>

/** Проект ушёл дальше `documents_confirmed`, а документы не доведены до settled. */
export function isDocumentsStageSkipped(
  records: StageValuesRecord,
  currentStage: ProjectStage,
): boolean {
  const stage: ProjectStage = 'documents_confirmed'
  const stageIdx = ALL_STAGE_ORDER.indexOf(stage)
  const currentIdx = ALL_STAGE_ORDER.indexOf(currentStage)
  if (currentIdx <= stageIdx) return false
  return !isDocumentsStageSettled(records[stage]?.values)
}

/**
 * Очередь бухгалтера: текущий этап подтверждения документов или пропущенный, но не закрытый.
 * TODO: при skip директором — фильтр списка «Запросов» может потребовать поле/флаг с бэка.
 */
export function needsAccountantDocumentsAttention(project: ProjectDetail): boolean {
  if (project.stage === 'documents_confirmed') return true
  const snapshots = project.stageSnapshots
  if (!snapshots) return false
  return isDocumentsStageSkipped(snapshots, project.stage)
}
