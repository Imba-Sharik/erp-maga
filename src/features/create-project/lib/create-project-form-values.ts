export type CreateProjectFormValues = {
  title: string
  eventType: string
  /** FK на каталог лофтов (строкой, т.к. value у Select всегда string). Пусто → не выбран. */
  loftId: string
  /** FK на каталог залов (обязателен на бэке). */
  hallId: string
}
