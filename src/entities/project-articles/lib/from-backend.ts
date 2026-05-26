import type { BackendProjectArticle } from '../model/backend-article'
import type { ArticleKind, ArticleValues, ProjectArticles } from '../model/types'
import { createEmptyBacklineBlock, createInitialArticles } from './initial'

const ARTICLE_KINDS: ReadonlySet<ArticleKind> = new Set([
  'equipment',
  'internet',
  'personnel',
  'consumables',
  'sublease',
  'screen',
  'transport',
  'tm',
])

function isBackendArticle(value: unknown): value is BackendProjectArticle {
  if (!value || typeof value !== 'object') return false
  const a = value as BackendProjectArticle
  return (
    (a.block === 'main' || a.block === 'backline') &&
    ARTICLE_KINDS.has(a.kind) &&
    typeof a.sales === 'number' &&
    typeof a.expense === 'number' &&
    typeof a.bonus_percent === 'number'
  )
}

/**
 * Статьи проекта с бэка (`ProjectDetail.articles`) → UI-модель `ProjectArticles`.
 * Стартуем с дефолтного набора (все статьи нулями) и накладываем пришедшие значения.
 * Блок `backline` создаётся только если в ответе есть хотя бы одна backline-статья.
 */
export function mapBackendArticles(
  articles: readonly unknown[] | null | undefined,
): ProjectArticles {
  const result = createInitialArticles()
  if (!articles || articles.length === 0) return result

  for (const raw of articles) {
    if (!isBackendArticle(raw)) continue
    const article = raw
    const values: ArticleValues = {
      sales: article.sales,
      expense: article.expense,
      bonusPercent: article.bonus_percent,
      ...(typeof article.bonus_amount === 'number' ? { bonusAmount: article.bonus_amount } : {}),
    }
    if (article.block === 'backline') {
      if (!result.backline) result.backline = createEmptyBacklineBlock()
      result.backline[article.kind] = values
    } else {
      result.main[article.kind] = values
    }
  }

  return result
}
