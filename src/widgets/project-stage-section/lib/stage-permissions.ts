import type { ProjectStage } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

const ALL_ROLES: readonly UserRole[] = ['manager', 'accountant', 'director']

// Полная карта прав по этапам. Тип `Record<...>` (без `Partial`) заставляет
// добавлять новый этап сюда явно — иначе TS подсветит ошибку.
const STAGE_EDIT_ROLES: Record<ProjectStage, readonly UserRole[]> = {
  plum_request: ALL_ROLES,
  first_contact: ['manager', 'director'],
  calc_ready: ['manager', 'director'],
  signed: ['manager', 'director'],
  ready: ['manager', 'director'],
  event_held: ['manager', 'director'],
  expenses_entered: ['manager', 'director'],
  documents_confirmed: ['accountant'],
  data_confirmed: ['director'],
  bonus_calculated: ['director'],
  bonus_approved: ['director'],
  closed: ALL_ROLES,
}

export function canEditStage(stage: ProjectStage, role: UserRole): boolean {
  return STAGE_EDIT_ROLES[stage].includes(role)
}
