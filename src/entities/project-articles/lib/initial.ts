import {
  ARTICLE_LABELS,
  type ArticleBlock,
  type ArticleKind,
  type ArticlesBlockMap,
  type ProjectArticles,
} from '../model/types'

import { DEFAULT_BONUS_PERCENT } from './defaults'

function buildBlock(block: ArticleBlock): ArticlesBlockMap {
  return Object.keys(ARTICLE_LABELS).reduce((acc, key) => {
    const kind = key as ArticleKind
    acc[kind] = {
      sales: null,
      expense: null,
      bonusPercent: DEFAULT_BONUS_PERCENT[block][kind] ?? 0,
    }
    return acc
  }, {} as ArticlesBlockMap)
}

export function createInitialArticles(): ProjectArticles {
  return {
    main: buildBlock('main'),
    backline: null,
  }
}

export function createEmptyBacklineBlock(): ArticlesBlockMap {
  return buildBlock('backline')
}
