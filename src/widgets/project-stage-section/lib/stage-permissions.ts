import type { ProjectStage } from '@/entities/project'
import { canEditCurrentStage } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

import type { StageFieldConfig } from './fields-map'

/**
 * Можно ли роли редактировать конкретное поле этапа.
 *
 * `context` — текущий этап (`'current'`) или пройденный задним числом (`'passed'`).
 * Блок-уровневый гейт: для текущего — ролевая матрица `STAGE_CAPABILITIES`; для
 * пройденного его уже сделал серверный флаг `can_edit_*` (форма правки открывается
 * только при нём), поэтому здесь для `'passed'` остаются лишь пофайловые исключения:
 * системные поля никем не редактируются; поля с собственным `editRoles`/`roles`
 * ограничены своим списком (так статус документов остаётся за Бухгалтером).
 */
export function canEditField(
  stage: ProjectStage,
  role: UserRole,
  field: StageFieldConfig,
  context: 'current' | 'passed' = 'current',
): boolean {
  if (context === 'current' && !canEditCurrentStage(stage, role)) return false
  if (field.source === 'system') return false
  const editRoles = field.editRoles ?? field.roles
  if (editRoles && !editRoles.includes(role)) return false
  return true
}
