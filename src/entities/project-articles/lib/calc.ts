import type {
  ArticleBlock,
  ArticleKind,
  ArticlesBlockMap,
  ProjectArticles,
} from '../model/types'

type Aspect = 'sales' | 'expense'

function sumBlock(block: ArticlesBlockMap | null, aspect: Aspect): number {
  if (!block) return 0
  return Object.values(block).reduce((acc, v) => acc + (v[aspect] || 0), 0)
}

export function blockTotal(
  articles: ProjectArticles,
  block: ArticleBlock,
  aspect: Aspect,
): number {
  return sumBlock(articles[block], aspect)
}

export function projectTotal(articles: ProjectArticles, aspect: Aspect): number {
  return sumBlock(articles.main, aspect) + sumBlock(articles.backline, aspect)
}

export function articlePercent(
  articles: ProjectArticles,
  block: ArticleBlock,
  kind: ArticleKind,
  aspect: Aspect,
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
