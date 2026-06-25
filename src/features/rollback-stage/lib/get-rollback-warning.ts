import type { ProjectStage } from '@/entities/project'

const BASE_WARNING = 'Данные текущего этапа будут стёрты безвозвратно.'

/** Уточнение по этапам, где есть что терять помимо обычных полей формы. */
const STAGE_EXTRA: Partial<Record<ProjectStage, string>> = {
  calculation_prepared: 'Будет стёрт подготовленный расчёт.',
  ready_to_event: 'Будет стёрта продажная часть (расчёты).',
  expenses_entered: 'Будут стёрты внесённые расходы (расчёты).',
  documents_confirmed: 'Будут стёрты статусы подтверждённых документов.',
  bonus_calculated: 'Будет стёрт рассчитанный бонус.',
  bonus_approved: 'Будет стёрт утверждённый бонус.',
}

/** Текст предупреждения для destructive-диалога отката: база + добавка по этапу. */
export function getRollbackWarning(stage: ProjectStage): string {
  const extra = STAGE_EXTRA[stage]
  return extra ? `${BASE_WARNING} ${extra}` : BASE_WARNING
}
