import type { StageFieldConfig, StageFieldSource } from './fields-map'

interface ReadonlySourceContext {
  /** Поле доступно для редактирования текущей ролью. */
  fieldEditable: boolean
  /** Этап — текущий (для passed-секции). */
  isCurrent?: boolean
  /** Роль может редактировать этап целиком. */
  canEditStage?: boolean
}

/**
 * Стиль read-only поля. Неактивные селекты (руководитель на documents_confirmed)
 * и поля на пройденных этапах — `system` (пунктир, бежевый фон), как до разделения прав.
 */
export function getReadonlyFieldSource(
  field: StageFieldConfig,
  { fieldEditable, isCurrent, canEditStage }: ReadonlySourceContext,
): StageFieldSource {
  if (field.source === 'system') return 'system'

  const stageContextOk =
    isCurrent === undefined || canEditStage === undefined ? true : isCurrent && canEditStage

  if (fieldEditable && stageContextOk) {
    return field.source ?? 'manager'
  }

  return 'system'
}
