import type { ProjectStage } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

const ALL_ROLES: readonly UserRole[] = ['manager', 'accountant', 'director']

// Полная карта прав по этапам. Тип `Record<...>` (без `Partial`) заставляет
// добавлять новый этап сюда явно — иначе TS подсветит ошибку.
const STAGE_EDIT_ROLES: Record<ProjectStage, readonly UserRole[]> = {
  plum_request: ALL_ROLES,
  primary_contact_done: ['manager', 'director'],
  calculation_prepared: ['manager', 'director'],
  contract_signed: ['manager', 'director'],
  ready_to_event: ['manager', 'director'],
  event_held: ['manager', 'director'],
  expenses_entered: ['manager', 'director'],
  documents_confirmed: ['accountant'],
  data_confirmed: ['director'],
  bonus_calculated: ['director'],
  bonus_approved: ['director'],
  closed: ALL_ROLES,
  out_of_mag_scope: [],
  archived: [],
}

export function canEditStage(stage: ProjectStage, role: UserRole): boolean {
  return STAGE_EDIT_ROLES[stage].includes(role)
}
