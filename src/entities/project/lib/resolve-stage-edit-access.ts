import type { UserRole } from '@/entities/user-role'

import type { ProjectStage } from '../model/types'

import { canAdvanceStage, canEditCurrentStage } from './stage-capabilities'

export interface StageEditAccess {
  /** Можно редактировать поля текущего этапа (роль + не read-only + этап текущий). */
  canEditCurrent: boolean
  /** Можно редактировать поля пройденного этапа задним числом (НЕ зависит от read-only). */
  canEditPassed: boolean
  /** Можно перевести проект на следующий этап. */
  canAdvance: boolean
}

export interface ResolveStageEditAccessArgs {
  stage: ProjectStage
  role: UserRole
  /** Этап является текущим этапом проекта. */
  isCurrent: boolean
  /** Проект открыт только для просмотра (чужой/пуловый) — гасит current-edit и advance. */
  readOnly: boolean
  /**
   * Серверный per-block флаг `can_edit_*` для блока этого этапа — единый источник
   * правды для правки задним числом (см. resolveStageBlockEditable). `undefined` —
   * у этапа нет block-ручки. НЕ зависит от `readOnly`: Руководитель смотрит проект
   * в режиме просмотра (ERP-197), но правит прошлые блоки (ERP-198).
   */
  blockEditable: boolean | undefined
}

/**
 * Ролевые права этапа, сведённые с режимами проекта. `canEditCurrent`/`canAdvance` —
 * фронтовая ролевая матрица (STAGE_CAPABILITIES). `canEditPassed` — серверный per-block
 * флаг: бэк уже учёл роль, стадию, владельца, archived/out_of_mag, `event_date`.
 */
export function resolveStageEditAccess({
  stage,
  role,
  isCurrent,
  readOnly,
  blockEditable,
}: ResolveStageEditAccessArgs): StageEditAccess {
  return {
    canEditCurrent: !readOnly && isCurrent && canEditCurrentStage(stage, role),
    canEditPassed: !isCurrent && Boolean(blockEditable),
    canAdvance: !readOnly && canAdvanceStage(stage, role),
  }
}
