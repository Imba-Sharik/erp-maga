import type { ProjectStage } from '@/entities/project'
import type { DataConfirmedStatus } from '@/features/update-data-confirmed-status'

import type { StageFieldConfig } from './fields-map'

/**
 * Селект статуса проверки данных на этапе `data_confirmed` (ERP-221): сохраняется
 * сразу при выборе (как статусы документов у бухгалтерии), а не при переходе этапа.
 */
export function isDataConfirmedStatusField(
  stage: ProjectStage,
  fieldName: StageFieldConfig['name'],
): boolean {
  return stage === 'data_confirmed' && fieldName === 'dataConfirmedStatus'
}

/** Значение селекта → статус проверки; `''`/чужие значения отбрасываем. */
export function parseDataConfirmedStatus(value: string): DataConfirmedStatus | undefined {
  return value === 'confirmed' || value === 'rejected' ? value : undefined
}

/**
 * «Не приняты» на этапе data_confirmed (по значению селекта) — системная пауза
 * (ERP-221): «Следующий этап» скрыт, блок этапа подсвечен, пока руководитель
 * не сменит статус на «Данные подтверждены».
 */
export function isDataRejectedStatus(stage: ProjectStage, status: unknown): boolean {
  return stage === 'data_confirmed' && status === 'rejected'
}
