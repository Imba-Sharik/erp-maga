import { ALL_STAGE_ORDER, type ProjectStage } from '@/entities/project'

/**
 * Предыдущий этап по полному порядку воронки (`ALL_STAGE_ORDER`).
 *
 * Возвращает `null`, если этап первый (`plum_request`) или вне порядка
 * (`out_of_mag_scope` отсутствует в `ALL_STAGE_ORDER`).
 */
export function getPreviousStage(stage: ProjectStage): ProjectStage | null {
  const index = ALL_STAGE_ORDER.indexOf(stage)
  if (index <= 0) return null
  return ALL_STAGE_ORDER[index - 1]
}
