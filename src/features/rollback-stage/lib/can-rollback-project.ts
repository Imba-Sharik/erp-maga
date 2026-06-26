import type { ProjectStage } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

import { getPreviousStage } from './get-previous-stage'

/**
 * Откат на предыдущий этап доступен только Руководителю, на ведомом (не read-only)
 * проекте и только если у текущего этапа есть допустимый предыдущий (ТЗ §4). Единый
 * источник правды: и для самой кнопки, и для условия показа ряда кнопок в шапке этапа.
 */
export function canRollbackProject(
  stage: ProjectStage,
  role: UserRole,
  readOnly: boolean,
): boolean {
  return role === 'director' && !readOnly && getPreviousStage(stage) !== null
}
