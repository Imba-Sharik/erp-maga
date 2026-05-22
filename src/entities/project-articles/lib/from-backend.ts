import type { ProjectArticle } from '@/shared/api/generated/types/ProjectArticle'

import type { ArticleValues, ProjectArticles } from '../model/types'
import { createEmptyBacklineBlock, createInitialArticles } from './initial'

/**
 * Статьи проекта с бэка (`ProjectDetailSchema.articles`) → UI-модель `ProjectArticles`.
 * Стартуем с дефолтного набора (все статьи нулями) и накладываем пришедшие значения.
 * Блок `backline` создаётся только если в ответе есть хотя бы одна backline-статья.
 */
export function mapBackendArticles(
  articles: readonly ProjectArticle[] | null | undefined,
): ProjectArticles {
  const result = createInitialArticles()
  if (!articles || articles.length === 0) return result

  for (const article of articles) {
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
