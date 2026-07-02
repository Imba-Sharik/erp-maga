import { useState } from 'react'

export interface PassedEditToggle {
  /** Идёт инлайн-редактирование пройденного этапа. */
  editing: boolean
  startEdit: () => void
  cancelEdit: () => void
  finishEdit: () => void
}

/**
 * Общий тоггл инлайн-редактирования пройденного этапа: кнопка «Редактировать» →
 * активные поля + «Сохранить»/«Отмена». Один и тот же контракт для generic-секции
 * (`StageSectionPassed`) и финансовых блоков — единообразная семантика (DRY).
 */
export function usePassedEditToggle(): PassedEditToggle {
  const [editing, setEditing] = useState(false)
  return {
    editing,
    startEdit: () => setEditing(true),
    cancelEdit: () => setEditing(false),
    finishEdit: () => setEditing(false),
  }
}
