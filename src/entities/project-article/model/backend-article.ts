import type { ArticleBlock, ArticleKind } from './types'

/** Формат элемента `ProjectDetail.articles[]` с бэка (пока нет в OpenAPI). */
export interface BackendProjectArticle {
  block: ArticleBlock
  kind: ArticleKind
  sales: number
  expense: number
  percent?: number
  bonus_percent: number
  bonus_amount?: number
}
