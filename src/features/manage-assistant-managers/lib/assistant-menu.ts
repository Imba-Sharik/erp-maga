import type { ManagerSelectOption } from '@/entities/manager'
import type { ProjectAssistantManager } from '@/entities/project'

export interface BuildAssistantCandidatesInput {
  /** Опции из справочника (уже отфильтрованы по залам проекта). */
  directoryOptions: readonly ManagerSelectOption[]
  leadManagerId: string | null | undefined
  assignedAssistants: readonly ProjectAssistantManager[]
  /** Режим «заменить»: оставить заменяемого вспомогательного среди кандидатов. */
  excludeAssistantId?: string
}

/**
 * Кандидаты во вспомогательные (ERP-189): из справочника по залам убираем
 * синтетические `name:*`, ведущего и уже назначенных. Сортировка — по имени (ru).
 */
export function buildAssistantCandidates({
  directoryOptions,
  leadManagerId,
  assignedAssistants,
  excludeAssistantId,
}: BuildAssistantCandidatesInput): ManagerSelectOption[] {
  const assignedIds = new Set(
    assignedAssistants.map((a) => a.id).filter((id) => id !== excludeAssistantId),
  )
  return directoryOptions
    .filter((o) => !o.id.startsWith('name:'))
    .filter((o) => o.id !== leadManagerId)
    .filter((o) => !assignedIds.has(o.id))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'))
}

export interface CanShowAddAssistantInput {
  /** Текущий пользователь — ведущий менеджер этого проекта. */
  isLeadManager: boolean
  /** Кандидаты, кого ещё можно назначить (см. buildAssistantCandidates). */
  assignableCandidates: readonly unknown[]
}

/** «+ Вспомогательный» показываем только ведущему и только если есть кого добавить. */
export function canShowAddAssistant({
  isLeadManager,
  assignableCandidates,
}: CanShowAddAssistantInput): boolean {
  return isLeadManager && assignableCandidates.length > 0
}

export interface AssistantMenuItem {
  id: string
  fullName: string
}

/** Пункты меню «уже назначенные вспомогательные» (с карандашиком), отсортированные. */
export function buildAssistantMenuItems(
  assignedAssistants: readonly ProjectAssistantManager[],
): AssistantMenuItem[] {
  return assignedAssistants
    .map((a) => ({ id: a.id, fullName: a.fullName }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'))
}
