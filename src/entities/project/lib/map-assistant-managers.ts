import type { ProjectAssistantManager } from '../model/types'

/** Сырой вспомогательный менеджер из (будущего) ответа бэка. */
export interface RawAssistantManager {
  id: number
  full_name?: string | null
}

/**
 * Маппит вспомогательных менеджеров из ответа бэка в домен (ERP-189).
 * Бэк пока поле `assistant_managers` не отдаёт — degrade в `[]`.
 */
export function mapAssistantManagers(
  raw: readonly RawAssistantManager[] | null | undefined,
): ProjectAssistantManager[] {
  if (!raw) return []
  return raw.map((m) => ({ id: String(m.id), fullName: m.full_name ?? '' }))
}
