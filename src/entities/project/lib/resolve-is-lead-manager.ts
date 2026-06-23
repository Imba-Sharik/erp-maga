/** Минимальный вход резолвера — только нужное поле. */
export interface IsLeadManagerInput {
  is_lead_manager?: boolean
}

/**
 * Текущий пользователь — ВЕДУЩИЙ менеджер проекта (ERP-189). Строгий дефолт:
 * признак берётся ТОЛЬКО из явного бэк-флага `is_lead_manager`. Намеренно НЕ
 * выводится из `can_edit` — у вспомогательного менеджера `can_edit` тоже `true`,
 * иначе он получил бы зелёный бейдж ведущего. Пока бэк флаг не отдаёт — `false`.
 */
export function resolveIsLeadManager(b: IsLeadManagerInput): boolean {
  return Boolean(b.is_lead_manager)
}
