import type { ProjectStage } from '@/entities/project'

import type { NotificationChannel, NotificationRecipient } from '../model/types'

export interface StageNotification {
  recipient: NotificationRecipient
  title: string
  channels: NotificationChannel[]
  /** Цвет точки-маркера слева в списке. */
  dotColor: string
}

/**
 * Этапы, переход НА которые рождает уведомление: роль-адресат, заголовок,
 * каналы и цвет маркера. Чтобы добавить/убрать триггер — правится только эта карта.
 * Telegram появится тут позже (добавлением `'telegram'` в `channels`).
 */
const STAGE_NOTIFICATIONS: Partial<Record<ProjectStage, StageNotification>> = {
  documents_confirmed: {
    recipient: 'accountant',
    title: 'Требуется подтверждение документов',
    channels: ['erp'],
    dotColor: '#4B61B9',
  },
  data_confirmed: {
    recipient: 'director',
    title: 'Требуется подтверждение данных',
    channels: ['erp'],
    dotColor: '#D8943E',
  },
  bonus_approved: {
    recipient: 'director',
    title: 'Требуется утверждение бонуса',
    channels: ['erp'],
    dotColor: '#3AA56B',
  },
}

/** Конфиг уведомления для этапа, если на этот этап шлётся уведомление. */
export function getStageNotification(stage: ProjectStage): StageNotification | undefined {
  return STAGE_NOTIFICATIONS[stage]
}
