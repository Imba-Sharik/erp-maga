/** Синхронно с OpenAPI ReasonEnum. */
export type OutsideMagReason = 'event_cancelled' | 'other_rental' | 'no_equipment'

export const OUTSIDE_MAG_REASON_OPTIONS: { value: OutsideMagReason; label: string }[] = [
  { value: 'event_cancelled', label: 'Отмена мероприятия' },
  { value: 'other_rental', label: 'Работает другой прокат' },
  { value: 'no_equipment', label: 'Без оборудования' },
]
