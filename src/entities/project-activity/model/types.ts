import type { UserRole } from '@/entities/user-role'

/** Запись «Лога действий» проекта — один шаг участника воронки. */
export interface ProjectActivityEvent {
  id: string
  /** Роль исполнителя для префикса («Менеджер»/«Бухгалтер»/«Руководитель»). С бэка не приходит. */
  actorRole?: UserRole
  actorName: string
  /** Готовая фраза действия — без префикса роли и имени. */
  action: string
  /** ISO-datetime события. */
  at: string
  /** Цвет точки слева — по умолчанию var(--info). */
  dotColor?: string
}
