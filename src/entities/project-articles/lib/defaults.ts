import type { ArticleBlock, ArticleKind } from '../model/types'

/**
 * Дефолтные % бонуса по статье на каждый блок.
 * Источник — макет Figma (исходные хардкоды из `FinanceBlockWithBackline`).
 * Когда бэк начнёт отдавать % per article — заменить чтение этих констант
 * на значения из API (см. `createInitialArticles`).
 */
export const DEFAULT_BONUS_PERCENT: Record<ArticleBlock, Record<ArticleKind, number>> = {
  main: {
    equipment: 53.5,
    internet: 1.5,
    personnel: 19.9,
    consumables: 2,
    sublease: 7,
    screen: 10.5,
    transport: 5.3,
    tm: 0,
  },
  backline: {
    equipment: 53.5,
    transport: 5.3,
    personnel: 19.9,
    consumables: 1.5,
    sublease: 7,
    tm: 2,
    // Эти статьи в бэклайне не отображаются, но тип `Record<ArticleKind, number>` требует все ключи.
    internet: 0,
    screen: 0,
  },
}
