import type { NotificationEventTypeEnumKey } from '@/shared/api/generated/types/Notification'

// Цвет точки уходит в инлайн-стиль (`style={{ backgroundColor }}`), поэтому
// ссылаемся на семантические токены через `var(--…)`, а не на hex.
const DEFAULT_DOT_COLOR = 'var(--info)'

const EVENT_DOT_COLORS: Partial<Record<NotificationEventTypeEnumKey, string>> = {
  stage_changed: 'var(--info)',
  project_created: 'var(--success)',
  out_of_mag: 'var(--warning-solid)',
  bonus_approved: 'var(--success)',
  data_rejected: 'var(--error)',
  manager_assigned: 'var(--violet)',
  other: 'var(--muted-foreground)',
}

export function getEventTypeDotColor(eventType: NotificationEventTypeEnumKey): string {
  return EVENT_DOT_COLORS[eventType] ?? DEFAULT_DOT_COLOR
}
