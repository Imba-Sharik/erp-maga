import type { ProjectAssistantManager } from '@/entities/project'

export type AssistantDialogMode = 'add' | 'edit'

export interface ApplyAssistantSelectionInput {
  current: readonly ProjectAssistantManager[]
  mode: AssistantDialogMode
  /** Редактируемый вспомогательный (для mode='edit'). */
  editingId?: string
  /** Выбранный менеджер или null — снять (только в edit). */
  selected: ProjectAssistantManager | null
}

/**
 * Новый набор вспомогательных после действия менеджера (ERP-189):
 * add — добавить выбранного; edit — заменить редактируемого на выбранного либо снять
 * (selected=null). Не мутирует вход.
 */
export function applyAssistantSelection({
  current,
  mode,
  editingId,
  selected,
}: ApplyAssistantSelectionInput): ProjectAssistantManager[] {
  if (mode === 'add') {
    if (!selected || current.some((a) => a.id === selected.id)) return [...current]
    return [...current, selected]
  }

  // edit
  if (!editingId) return [...current]
  if (!selected) return current.filter((a) => a.id !== editingId)
  return current.map((a) => (a.id === editingId ? selected : a))
}
