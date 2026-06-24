import type { ProjectAssistantManager } from '../model/types'

/**
 * Сырой вспомогательный менеджер из ответа бэка (`AssistantManagerBrief`).
 * `id` — id строки связи (фронту не нужен), `manager_id` — id пользователя-менеджера.
 */
export interface RawAssistantManager {
  id: number
  manager_id: number
  full_name?: string | null
}

/**
 * Маппит вспомогательных менеджеров из ответа бэка в домен (ERP-189). Идентичность
 * ассистента — это `manager_id` (user id): по нему его сравнивают с ведущим и текущим
 * пользователем и снимают через DELETE. Поле отсутствует/пусто — degrade в `[]`.
 */
export function mapAssistantManagers(
  raw: readonly RawAssistantManager[] | null | undefined,
): ProjectAssistantManager[] {
  if (!raw) return []
  return raw.map((m) => ({ id: String(m.manager_id), fullName: m.full_name ?? '' }))
}
