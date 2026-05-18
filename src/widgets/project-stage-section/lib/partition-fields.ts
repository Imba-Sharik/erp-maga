import type { ProjectStage, StageFormData } from '@/entities/project'

import type { StageFieldConfig } from './fields-map'

/**
 * Имена «системных» полей-метаданных перехода — кто и когда перевёл проект в этап.
 * На большинстве этапов выносятся в нижнюю секцию «Информация» — чтобы layout
 * пройденных этапов соответствовал финансовым блокам (`ready`/`expenses_entered`).
 */
const META_FIELD_NAMES: ReadonlyArray<keyof StageFormData> = [
  'leadManager',
  'contactedAt',
  'closingFunnelEnteredAt',
]

/** На этих этапах `leadManager` — это не «кто перевёл», а «получатель/ведущий менеджер проекта»; не выносим. */
const STAGES_WITH_PROJECT_LEAD_MANAGER: ReadonlyArray<ProjectStage> = ['bonus_calculated', 'closed']

export function partitionFields(stage: ProjectStage, fields: StageFieldConfig[]) {
  if (STAGES_WITH_PROJECT_LEAD_MANAGER.includes(stage)) {
    return { main: fields, meta: [] as StageFieldConfig[] }
  }
  const meta: StageFieldConfig[] = []
  const main: StageFieldConfig[] = []
  for (const f of fields) {
    if (META_FIELD_NAMES.includes(f.name)) meta.push(f)
    else main.push(f)
  }
  return { main, meta }
}
