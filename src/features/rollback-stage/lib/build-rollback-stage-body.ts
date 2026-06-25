import { projectStageToApi, type Project } from '@/entities/project'
import type { ProjectTransitionRequestTargetStageEnumKey } from '@/shared/api/generated/types/ProjectTransitionRequest'

import { getPreviousStage } from './get-previous-stage'

/**
 * Бэк отката (ERP-199) ещё НЕ готов — контракт тела перехода не подтверждён.
 *
 * Пока флаг выключен, `useRollbackStage` не шлёт реальный запрос (показывает
 * inline-уведомление о заглушке). Включать ТОЛЬКО после согласования формы тела
 * с бэком — тогда же поправить `buildRollbackStageBody` под итоговый контракт.
 */
export const ROLLBACK_TRANSITION_READY = false

export interface BuildRollbackStageBodyOptions {
  /** Новая фактическая дата мероприятия (ERP-209) — для отката с `event_held`. */
  eventDate?: string
}

/**
 * Провизорная форма тела отката — ДОГАДКА по аналогии с `return_from_out_of_mag`
 * (`to_stage`-действие + `target_stage` предыдущего этапа во вложенном `payload`,
 * которого нет в сгенерированном OpenAPI).
 *
 * TODO(BE): контракт отката не подтверждён — выверить форму тела с бэком (ERP-199).
 */
export type RollbackStageTransitionRequest = {
  to_stage: 'rollback_to_previous'
  payload: {
    target_stage: ProjectTransitionRequestTargetStageEnumKey
    event_date?: string
  }
}

export function buildRollbackStageBody(
  project: Pick<Project, 'stage'>,
  options: BuildRollbackStageBodyOptions = {},
): RollbackStageTransitionRequest {
  const previousStage = getPreviousStage(project.stage)
  if (!previousStage) {
    throw new Error(`Нет предыдущего этапа для стадии «${project.stage}»`)
  }

  return {
    to_stage: 'rollback_to_previous',
    payload: {
      target_stage: projectStageToApi(previousStage),
      ...(options.eventDate ? { event_date: options.eventDate } : {}),
    },
  }
}
