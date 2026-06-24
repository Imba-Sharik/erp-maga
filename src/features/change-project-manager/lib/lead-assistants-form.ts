import type { ManagerSelectOption } from '@/entities/manager'

/** Текущий выбор в модалке руководителя: один ведущий + набор вспомогательных. */
export interface LeadAssistantsSelection {
  leadId: string | null
  assistantIds: string[]
}

/** Опция селекта с признаком блокировки (выбран в соседнем селекте). */
export interface LeadAssistantOption {
  id: string
  fullName: string
  disabled: boolean
}

export type LeadAssistantsErrorKey = 'lead_required'

export interface LeadAssistantsState {
  leadOptions: LeadAssistantOption[]
  assistantOptions: LeadAssistantOption[]
  canApply: boolean
  errorKey: LeadAssistantsErrorKey | null
  hasChanges: boolean
}

export interface ResolveLeadAssistantsStateInput {
  assignableOptions: readonly ManagerSelectOption[]
  selection: LeadAssistantsSelection
  /** Исходный выбор (на момент открытия) — для вычисления hasChanges. */
  initial: LeadAssistantsSelection
}

const ERROR_MESSAGES: Record<LeadAssistantsErrorKey, string> = {
  lead_required: 'Выберите ведущего менеджера — нельзя оставить только вспомогательных.',
}

function sameSelection(a: LeadAssistantsSelection, b: LeadAssistantsSelection): boolean {
  if (a.leadId !== b.leadId) return false
  if (a.assistantIds.length !== b.assistantIds.length) return false
  const setB = new Set(b.assistantIds)
  return a.assistantIds.every((id) => setB.has(id))
}

/**
 * Состояние модалки руководителя (ERP-189): взаимный дизейбл селектов (нельзя быть и
 * ведущим, и вспомогательным), запрет применить при назначенных вспомогательных без
 * ведущего, доступность кнопки «Применить».
 */
export function resolveLeadAssistantsState({
  assignableOptions,
  selection,
  initial,
}: ResolveLeadAssistantsStateInput): LeadAssistantsState {
  const assistantSet = new Set(selection.assistantIds)
  const leadOptions = assignableOptions.map((o) => ({
    id: o.id,
    fullName: o.fullName,
    disabled: assistantSet.has(o.id),
  }))
  const assistantOptions = assignableOptions.map((o) => ({
    id: o.id,
    fullName: o.fullName,
    disabled: o.id === selection.leadId,
  }))

  const errorKey: LeadAssistantsErrorKey | null =
    selection.leadId == null && selection.assistantIds.length > 0 ? 'lead_required' : null
  const hasChanges = !sameSelection(selection, initial)
  const canApply = errorKey == null && hasChanges

  return { leadOptions, assistantOptions, canApply, errorKey, hasChanges }
}

/**
 * Назначить/снять ведущего. Если новый ведущий был среди вспомогательных — убирает его
 * оттуда (нельзя быть и тем, и другим).
 */
export function setLead(
  selection: LeadAssistantsSelection,
  leadId: string | null,
): LeadAssistantsSelection {
  return {
    leadId,
    assistantIds:
      leadId == null
        ? [...selection.assistantIds]
        : selection.assistantIds.filter((id) => id !== leadId),
  }
}

/** Переключить вспомогательного (add/remove), без дублей и без мутации входа. */
export function toggleAssistant(
  selection: LeadAssistantsSelection,
  id: string,
): LeadAssistantsSelection {
  const has = selection.assistantIds.includes(id)
  return {
    ...selection,
    assistantIds: has
      ? selection.assistantIds.filter((x) => x !== id)
      : [...selection.assistantIds, id],
  }
}

export function getLeadAssistantsErrorMessage(key: LeadAssistantsErrorKey): string {
  return ERROR_MESSAGES[key]
}
