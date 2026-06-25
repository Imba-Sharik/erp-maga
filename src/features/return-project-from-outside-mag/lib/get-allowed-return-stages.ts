import {
  PRE_PROJECT_STAGES,
  isStageAtLeast,
  type PreprojectStage,
  type ProjectStage,
} from '@/entities/project'

/**
 * Этапы, на которые можно вернуть проект из «Вне контура MAG»: предыдущие + последний активный.
 * Ориентир — `lastActiveStage` (может быть предпроектным или закрывающим этапом, либо отсутствовать).
 */
export function getAllowedReturnStages(lastActiveStage?: ProjectStage): PreprojectStage[] {
  if (lastActiveStage == null) return [...PRE_PROJECT_STAGES]
  const allowed = PRE_PROJECT_STAGES.filter((stage) => isStageAtLeast(lastActiveStage, stage))
  // Подстраховка: если lastActiveStage неизвестен ALL_STAGE_ORDER, не отдаём пустой (нечего выбрать) список.
  return allowed.length > 0 ? allowed : [...PRE_PROJECT_STAGES]
}
