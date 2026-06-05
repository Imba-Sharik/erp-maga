import type {
  ArticleKind,
  ArticlesBlockMap,
  ArticleValues,
  FinanceAspect,
  ProjectArticles,
} from '../model/types'

function normalizeBlock(
  block: ArticlesBlockMap | null,
  aspect: FinanceAspect,
): ArticlesBlockMap | null {
  if (!block) return null

  const next = { ...block }
  for (const kind of Object.keys(block) as ArticleKind[]) {
    const values: ArticleValues = block[kind]
    if (values[aspect] === 0) {
      next[kind] = { ...values, [aspect]: null }
    }
  }
  return next
}

/**
 * Бэк отдаёт незаполненные статьи как `0`. Перед редактированием трактуем их как «ещё не вводили».
 */
export function normalizeAspectZeroToNull(
  articles: ProjectArticles,
  aspect: FinanceAspect,
): ProjectArticles {
  return {
    main: normalizeBlock(articles.main, aspect)!,
    backline: normalizeBlock(articles.backline, aspect),
  }
}
