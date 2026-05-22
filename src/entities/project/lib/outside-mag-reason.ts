/** Синхронно с OpenAPI ReasonEnum. */
export type OutsideMagReason = 'event_cancelled' | 'other_rental' | 'no_equipment'

export const OUTSIDE_MAG_REASON_OPTIONS: { value: OutsideMagReason; label: string }[] = [
  { value: 'event_cancelled', label: 'Отмена мероприятия' },
  { value: 'other_rental', label: 'Работает другой прокат' },
  { value: 'no_equipment', label: 'Без оборудования' },
]

const REASON_LABEL_BY_VALUE = Object.fromEntries(
  OUTSIDE_MAG_REASON_OPTIONS.map((o) => [o.value, o.label]),
) as Record<OutsideMagReason, string>

export function getOutsideMagReasonLabel(reason: string | null | undefined): string {
  if (!reason) return '—'
  return REASON_LABEL_BY_VALUE[reason as OutsideMagReason] ?? reason
}
