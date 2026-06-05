import type {
  ArticleBlock,
  ArticleKind,
  ArticlesBlockMap,
  ArticleValues,
  FinanceAspect,
  ProjectArticles,
} from '../model/types'

function sumBlock(block: ArticlesBlockMap | null, aspect: FinanceAspect): number {
  if (!block) return 0
  return Object.values(block).reduce((acc, v) => acc + (v[aspect] ?? 0), 0)
}

export function blockTotal(
  articles: ProjectArticles,
  block: ArticleBlock,
  aspect: FinanceAspect,
): number {
  return sumBlock(articles[block], aspect)
}

export function projectTotal(articles: ProjectArticles, aspect: FinanceAspect): number {
  return sumBlock(articles.main, aspect) + sumBlock(articles.backline, aspect)
}

export function articlePercent(
  articles: ProjectArticles,
  block: ArticleBlock,
  kind: ArticleKind,
  aspect: FinanceAspect,
): number {
  const total = blockTotal(articles, block, aspect)
  if (total <= 0) return 0
  const value = articles[block]?.[kind]?.[aspect] ?? 0
  return (value / total) * 100
}

export function taxAmount(totalSales: number, taxRate: number): number {
  if (totalSales <= 0 || taxRate <= 0) return 0
  return (totalSales * taxRate) / 100
}

/**
 * Бонус по одной статье: при override руководителя — возвращает override,
 * иначе формула `(sales − expense) × bonusPercent / 100`.
 */
export function articleBonusAmount(values: ArticleValues): number {
  const netProfit = (values.sales ?? 0) - (values.expense ?? 0)
  const formula = (netProfit * values.bonusPercent) / 100
  return values.bonusAmount ?? formula
}

/** Итоговый бонус по проекту: сумма `articleBonusAmount` по всем статьям (main + backline, если есть). */
export function bonusTotal(articles: ProjectArticles): number {
  let total = 0
  for (const v of Object.values(articles.main)) total += articleBonusAmount(v)
  if (articles.backline) {
    for (const v of Object.values(articles.backline)) total += articleBonusAmount(v)
  }
  return total
}
