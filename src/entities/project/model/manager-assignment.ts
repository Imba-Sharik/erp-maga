/**
 * Анонсируемый контракт назначения менеджеров проекта (ERP-189).
 *
 * Бэк пока принимает только `mag_manager_id` (ведущий). Поле `assistant_manager_ids`
 * задаёт ЦЕЛЕВУЮ форму PATCH-запроса: список заменяет весь набор вспомогательных.
 * До появления поля на бэке ассистенты применяются на фронте (см. шов в фичах).
 */
export interface ChangeManagersRequest {
  mag_manager_id: number | null
  assistant_manager_ids: number[]
}
