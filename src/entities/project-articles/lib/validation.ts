import type { ArticleBlock, ArticleKind, FinanceAspect, ProjectArticles } from '../model/types'
import { BACKLINE_ARTICLE_KINDS, MAIN_ARTICLE_KINDS } from '../model/types'

export interface UnfilledFinanceArticle {
  block: ArticleBlock
  kind: ArticleKind
}

export function listUnfilledFinanceAspectFields(
  articles: ProjectArticles,
  aspect: FinanceAspect,
): UnfilledFinanceArticle[] {
  const missing: UnfilledFinanceArticle[] = []

  for (const kind of MAIN_ARTICLE_KINDS) {
    if (articles.main[kind][aspect] === null) {
      missing.push({ block: 'main', kind })
    }
  }
  if (articles.backline) {
    for (const kind of BACKLINE_ARTICLE_KINDS) {
      if (articles.backline[kind][aspect] === null) {
        missing.push({ block: 'backline', kind })
      }
    }
  }

  return missing
}

/** Все обязательные статьи блока заполнены (включая явный `0`). */
export function areFinanceAspectFieldsFilled(
  articles: ProjectArticles,
  aspect: FinanceAspect,
): boolean {
  return listUnfilledFinanceAspectFields(articles, aspect).length === 0
}
