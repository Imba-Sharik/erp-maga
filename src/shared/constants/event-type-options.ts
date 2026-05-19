/** Тип мероприятия Plum: код (id) и подпись для UI. */
export type EventTypeOption = {
  readonly id: number
  readonly label: string
}

/** Варианты типа мероприятия (код Plum → подпись). */
export const EVENT_TYPE_OPTIONS: readonly EventTypeOption[] = [
  { id: 1, label: 'Частное мероприятие' },
  { id: 2, label: 'Свадьба' },
  { id: 3, label: 'Корпоратив' },
  { id: 6, label: 'Выпускной' },
  { id: 8, label: 'Концерт' },
  { id: 17, label: 'Съёмка' },
  { id: 18, label: 'Фестиваль' },
  { id: 20, label: 'Конференция' },
  { id: 21, label: 'Презентация' },
  { id: 22, label: 'Выставка' },
  { id: 23, label: 'Партнёрское' },
  { id: 43, label: 'Вечеринка' },
] as const

export function getEventTypeLabelById(id: string): string | undefined {
  return EVENT_TYPE_OPTIONS.find((o) => String(o.id) === id)?.label
}
