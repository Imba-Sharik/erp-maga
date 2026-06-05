import type { ArticleBlock, ArticleKind } from '../model/types'

/**
 * Дефолтные % бонуса по статье на каждый блок.
 * Источник — макет Figma (исходные хардкоды из `FinanceBlockWithBackline`).
 * Когда бэк начнёт отдавать % per article — заменить чтение этих констант
 * на значения из API (см. `createInitialArticles`).
 */
export const DEFAULT_BONUS_PERCENT: Record<ArticleBlock, Record<ArticleKind, number>> = {
  main: {
    equipment: 5,
    internet: 5,
    personnel: 5,
    consumables: 5,
    sublease: 5,
    screen: 5,
    transport: 5,
    tm: 5,
  },
  backline: {
    equipment: 5,
    transport: 5,
    personnel: 5,
    consumables: 5,
    sublease: 5,
    tm: 5,
    // Эти статьи в бэклайне не отображаются, но тип `Record<ArticleKind, number>` требует все ключи.
    internet: 0,
    screen: 0,
  },
}
