export type CreateProjectFormValues = {
  title: string
  eventType: string
  eventDate: string
  /** id лофтов (строками) — производное от выбранных залов. */
  lofts: string[]
  /** id залов (строками) — источник правды. */
  halls: string[]
  /** id менеджера MAG (строкой) для lead/admin; пусто = бэкенд назначит сам. */
  magManagerId?: string
}
