import type { NotificationChannel } from '../model/types'

/** Порядок каналов для фильтра и тегов. */
export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = ['erp', 'telegram']

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  erp: 'ERP',
  telegram: 'Telegram',
}
