import type { ProjectStage } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

import { canAdvanceStage, canEditStage } from './stage-permissions'

export interface StageEditAccess {
  /** Можно редактировать поля этапа (ролевое право И проект не в режиме просмотра). */
  canEdit: boolean
  /** Можно перевести проект на следующий этап. */
  canAdvance: boolean
}

/**
 * Ролевые права этапа, суженные глобальным режимом read-only. Если проект открыт
 * только для просмотра (чужой/пуловый), любые права редактирования гасятся, даже
 * если роль их в обычной ситуации имеет.
 */
export function resolveStageEditAccess(
  stage: ProjectStage,
  role: UserRole,
  readOnly: boolean,
): StageEditAccess {
  if (readOnly) {
    return { canEdit: false, canAdvance: false }
  }
  return {
    canEdit: canEditStage(stage, role),
    canAdvance: canAdvanceStage(stage, role),
  }
}
