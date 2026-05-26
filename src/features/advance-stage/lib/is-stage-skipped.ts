import { ALL_STAGE_ORDER, type ProjectStage } from '@/entities/project'
import { isDocumentsStageSkipped } from '@/entities/project-documents'

import type { StageRecords } from '../model/use-stage-flow'

/** Этапы, которые можно пропустить полностью (форма опциональна, advance проходит с пустыми полями). */
const SKIPPABLE_STAGES: ReadonlySet<ProjectStage> = new Set<ProjectStage>([
  'contract_signed',
  'documents_confirmed',
])

/**
 * Этап считается пропущенным, если проект уже перешёл дальше, а ключевые
 * поля этапа не заполнены. Производное состояние (без отдельного флага),
 * чтобы пережить перезагрузку без поддержки на бэке.
 */
export function isStageSkipped(
  stage: ProjectStage,
  currentStage: ProjectStage,
  records: StageRecords,
): boolean {
  if (!SKIPPABLE_STAGES.has(stage)) return false
  const stageIdx = ALL_STAGE_ORDER.indexOf(stage)
  const currentIdx = ALL_STAGE_ORDER.indexOf(currentStage)
  if (currentIdx <= stageIdx) return false

  const values = records[stage]?.values
  if (stage === 'contract_signed') {
    return !values?.contractNumber && !values?.contractDate && !values?.contractType
  }
  if (stage === 'documents_confirmed') {
    return isDocumentsStageSkipped(records, currentStage)
  }
  return false
}
