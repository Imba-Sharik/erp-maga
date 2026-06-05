import type { FinanceAspect, ProjectArticles } from '../model/types'
import { BACKLINE_ARTICLE_KINDS, MAIN_ARTICLE_KINDS } from '../model/types'

/** Все обязательные статьи блока заполнены (включая явный `0`). */
export function areFinanceAspectFieldsFilled(
  articles: ProjectArticles,
  aspect: FinanceAspect,
): boolean {
  for (const kind of MAIN_ARTICLE_KINDS) {
    if (articles.main[kind][aspect] === null) return false
  }
  if (articles.backline) {
    for (const kind of BACKLINE_ARTICLE_KINDS) {
      if (articles.backline[kind][aspect] === null) return false
    }
  }
  return true
}
