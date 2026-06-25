import type { ProjectRollbackStageRequest } from '@/shared/api/generated/types/ProjectRollbackStageRequest'

export interface BuildRollbackStageBodyOptions {
  /**
   * Новая фактическая дата мероприятия (ERP-209). Обязательна для отката с `event_held`
   * (`event_held → ready_to_event`); для остальных откатов не передаётся.
   */
  eventDate?: string
}

/**
 * Тело `POST /api/v1/projects/{id}/rollback-stage/`. Предыдущий этап бэк определяет сам
 * по текущей стадии — слать ничего, кроме `event_date`, не нужно.
 */
export function buildRollbackStageBody(
  options: BuildRollbackStageBodyOptions = {},
): ProjectRollbackStageRequest {
  return options.eventDate ? { event_date: options.eventDate } : {}
}
