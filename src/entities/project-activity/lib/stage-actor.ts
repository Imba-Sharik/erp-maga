import type { ProjectStage } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

/**
 * Кто типично выполняет переход НА этот этап. Используется только для
 * подписи в логе действий — не подменяет права из `canEditStage`.
 */
const STAGE_PRIMARY_ROLE: Partial<Record<ProjectStage, UserRole>> = {
  primary_contact_done: 'manager',
  calculation_prepared: 'manager',
  contract_signed: 'manager',
  ready_to_event: 'manager',
  event_held: 'manager',
  expenses_entered: 'manager',
  documents_confirmed: 'accountant',
  data_confirmed: 'director',
  bonus_calculated: 'director',
  bonus_approved: 'director',
  closed: 'manager',
}

export function getStagePrimaryRole(stage: ProjectStage): UserRole | undefined {
  return STAGE_PRIMARY_ROLE[stage]
}
