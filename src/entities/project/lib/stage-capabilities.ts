import type { UserRole } from '@/entities/user-role'

import type { ProjectStage } from '../model/types'

/**
 * Ролевая политика этапов для действий, которые НЕ выражены серверными per-block
 * флагами: правка полей ТЕКУЩЕГО этапа и перевод проекта вперёд. Правку ПРОЙДЕННЫХ
 * блоков задним числом гейтит бэк (`can_edit_*`, см. resolveStageBlockEditable) —
 * единый источник правды, поэтому здесь её больше нет.
 *
 * Выдать новой роли право = дописать роль в нужный список (одно место, DRY/SRP).
 */
export interface StageCapability {
  /** Может редактировать/заполнять поля, пока этап ТЕКУЩИЙ. */
  readonly editCurrent: readonly UserRole[]
  /** Может перевести проект на следующий этап. */
  readonly advance: readonly UserRole[]
}

const ALL: readonly UserRole[] = ['manager', 'accountant', 'director']
const MGR_DIR: readonly UserRole[] = ['manager', 'director']

// `Record` (не `Partial`): новый этап в `ProjectStage` заставит TS потребовать
// запись здесь — нельзя забыть назначить права.
export const STAGE_CAPABILITIES: Record<ProjectStage, StageCapability> = {
  plum_request: { editCurrent: ALL, advance: ALL },
  primary_contact_done: { editCurrent: MGR_DIR, advance: MGR_DIR },
  calculation_prepared: { editCurrent: MGR_DIR, advance: MGR_DIR },
  contract_signed: { editCurrent: MGR_DIR, advance: MGR_DIR },
  ready_to_event: { editCurrent: MGR_DIR, advance: MGR_DIR },
  event_held: { editCurrent: MGR_DIR, advance: MGR_DIR },
  expenses_entered: { editCurrent: MGR_DIR, advance: MGR_DIR },
  // Подтверждение статусов документов — только Бухгалтер; Руководителю недоступно
  // (ТЗ ERP-198). `advance` оставлен Бухгалтеру и Руководителю: последний вправе
  // пропустить опциональный этап, не редактируя его поля.
  documents_confirmed: {
    editCurrent: ['manager', 'accountant'],
    advance: ['accountant', 'director'],
  },
  data_confirmed: { editCurrent: ['director'], advance: ['director'] },
  bonus_calculated: { editCurrent: ['director'], advance: ['director'] },
  bonus_approved: { editCurrent: ['director'], advance: ['director'] },
  closed: { editCurrent: ALL, advance: ALL },
  out_of_mag_scope: { editCurrent: [], advance: [] },
  archived: { editCurrent: [], advance: [] },
}

/** Роль может редактировать/заполнять поля этапа, пока он текущий. */
export function canEditCurrentStage(stage: ProjectStage, role: UserRole): boolean {
  return STAGE_CAPABILITIES[stage].editCurrent.includes(role)
}

/** Роль может перевести проект на следующий этап. */
export function canAdvanceStage(stage: ProjectStage, role: UserRole): boolean {
  return STAGE_CAPABILITIES[stage].advance.includes(role)
}
