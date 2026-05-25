import type { NotificationEventTypeEnumKey } from '@/shared/api/generated/types/Notification'

const DEFAULT_DOT_COLOR = '#4B61B9'

const EVENT_DOT_COLORS: Partial<Record<NotificationEventTypeEnumKey, string>> = {
  stage_changed: '#4B61B9',
  project_created: '#3AA56B',
  out_of_mag: '#D8943E',
  bonus_approved: '#3AA56B',
  data_rejected: '#D25252',
  manager_assigned: '#6B5B95',
  other: '#ACACAC',
}

export function getEventTypeDotColor(eventType: NotificationEventTypeEnumKey): string {
  return EVENT_DOT_COLORS[eventType] ?? DEFAULT_DOT_COLOR
}
