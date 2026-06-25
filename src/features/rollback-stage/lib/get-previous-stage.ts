import { ALL_STAGE_ORDER, type ProjectStage } from '@/entities/project'

/**
 * Предыдущий этап по полному порядку воронки (`ALL_STAGE_ORDER`).
 *
 * Возвращает `null`, если откат недопустим (ТЗ §4.3): этап первый (`plum_request`),
 * архивный (`archived`) или вне порядка (`out_of_mag_scope` — для него отдельное
 * действие «вернуть из вне контура», а не откат).
 */
export function getPreviousStage(stage: ProjectStage): ProjectStage | null {
  if (stage === 'archived') return null
  const index = ALL_STAGE_ORDER.indexOf(stage)
  if (index <= 0) return null
  return ALL_STAGE_ORDER[index - 1]
}
