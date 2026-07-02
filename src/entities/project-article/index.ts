export type {
  ArticleKind,
  ArticleBlock,
  ArticleValues,
  ArticlesBlockMap,
  FinanceAspect,
  ProjectArticles,
} from './model/types'
export { ARTICLE_LABELS, MAIN_ARTICLE_KINDS, BACKLINE_ARTICLE_KINDS } from './model/types'
export { createInitialArticles, createEmptyBacklineBlock } from './lib/initial'
export { normalizeAspectZeroToNull } from './lib/normalize'
export {
  areFinanceAspectFieldsFilled,
  listUnfilledFinanceAspectFields,
  type UnfilledFinanceArticle,
} from './lib/validation'
export { mapBackendArticles } from './lib/from-backend'
export {
  blockTotal,
  projectTotal,
  articlePercent,
  taxAmount,
  articleBonusAmount,
  bonusTotal,
} from './lib/calc'
export {
  formatMoney,
  roundMoney,
  formatPercent,
  parseMoney,
  parsePercent,
} from '@/shared/lib/money'
