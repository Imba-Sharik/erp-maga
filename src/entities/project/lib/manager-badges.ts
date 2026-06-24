const LEAD_LABEL = 'Ведущий'
const ASSISTANT_LABEL = 'Вспом.'
const EMPTY = '—'

/** Тон бейджа: зелёный (свой), жёлтый (чужой ведущий), серый (нейтрально). */
export type ManagerBadgeVariant = 'managerSelf' | 'warning' | 'managerNeutral'

export interface ManagerBadgeRow {
  kind: 'lead' | 'assistant'
  /** Готовый текст строки (он же title для truncate). */
  text: string
  variant: ManagerBadgeVariant
}

export interface ResolveManagerBadgesInput {
  /** Текущая роль — менеджер (для остальных ролей бейджи нейтральные). */
  isManager: boolean
  /** Текущий пользователь — ВЕДУЩИЙ менеджер проекта. */
  isLeadManager: boolean
  /** Имя ведущего менеджера (пусто, если не назначен). */
  leadName: string
  /** Имена вспомогательных менеджеров. */
  assistantNames: readonly string[]
}

/**
 * Бейджи менеджеров карточки (ERP-189). Две строки:
 * - «Ведущий»: зелёная если ведущий — текущий пользователь, жёлтая если другой,
 *   серая для не-менеджера или непривязанного проекта.
 * - «Вспом.»: ВСЕГДА серая; по строке на каждого вспомогательного.
 */
export function resolveManagerBadges({
  isManager,
  isLeadManager,
  leadName,
  assistantNames,
}: ResolveManagerBadgesInput): ManagerBadgeRow[] {
  const leadVariant: ManagerBadgeVariant =
    !isManager || !leadName ? 'managerNeutral' : isLeadManager ? 'managerSelf' : 'warning'

  const rows: ManagerBadgeRow[] = [
    { kind: 'lead', text: `${LEAD_LABEL}: ${leadName || EMPTY}`, variant: leadVariant },
  ]

  // Каждый вспомогательный — отдельной плашкой, как ведущий.
  for (const name of assistantNames) {
    rows.push({
      kind: 'assistant',
      text: `${ASSISTANT_LABEL}: ${name}`,
      variant: 'managerNeutral',
    })
  }

  return rows
}
