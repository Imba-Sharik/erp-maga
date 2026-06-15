import type { LoftHallFormValues } from '@/entities/venue'

export type CreateProjectFormValues = LoftHallFormValues & {
  title: string
  eventType: string
  eventDate: string
  /** id менеджера MAG (строкой) для lead/admin; пусто = бэкенд назначит сам. */
  magManagerId?: string
}
