import {
  ARTICLE_LABELS,
  type ArticleKind,
  type ArticlesBlockMap,
  type ProjectArticles,
} from '../model/types'

function buildBlock(): ArticlesBlockMap {
  return Object.keys(ARTICLE_LABELS).reduce((acc, key) => {
    const kind = key as ArticleKind
    acc[kind] = {
      sales: null,
      expense: null,
      bonusPercent: 0,
    }
    return acc
  }, {} as ArticlesBlockMap)
}

export function createInitialArticles(): ProjectArticles {
  return {
    main: buildBlock(),
    backline: null,
  }
}

export function createEmptyBacklineBlock(): ArticlesBlockMap {
  return buildBlock()
}
