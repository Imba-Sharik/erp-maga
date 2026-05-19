export type ArticleKind =
  | 'equipment'
  | 'internet'
  | 'personnel'
  | 'consumables'
  | 'sublease'
  | 'screen'
  | 'transport'
  | 'tm'

export type ArticleBlock = 'main' | 'backline'

export const ARTICLE_LABELS: Record<ArticleKind, string> = {
  equipment: 'Оборудование',
  internet: 'Интернет',
  personnel: 'Персонал',
  consumables: 'Расходники',
  sublease: 'Субаренда',
  screen: 'Экран',
  transport: 'Транспорт',
  tm: 'ТМ',
}

export const MAIN_ARTICLE_KINDS: readonly ArticleKind[] = [
  'equipment',
  'internet',
  'personnel',
  'consumables',
  'sublease',
  'screen',
  'transport',
  'tm',
] as const

export const BACKLINE_ARTICLE_KINDS: readonly ArticleKind[] = [
  'equipment',
  'transport',
  'personnel',
  'consumables',
  'sublease',
  'tm',
] as const

export interface ArticleValues {
  sales: number
  expense: number
  bonusPercent: number
  /**
   * Override итогового «Бонус по статье». Если не задан — считается формулой
   * `net_profit × bonusPercent / 100`. Заполняется руководителем на этапе 10/11.
   */
  bonusAmount?: number
}

export type ArticlesBlockMap = Record<ArticleKind, ArticleValues>

export interface ProjectArticles {
  main: ArticlesBlockMap
  backline: ArticlesBlockMap | null
}
