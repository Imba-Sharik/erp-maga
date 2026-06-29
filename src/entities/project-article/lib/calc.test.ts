import { describe, expect, it } from 'vitest'

import type { ArticleValues } from '../model/types'
import { articleBonusAmount, bonusTotal } from './calc'
import { createEmptyBacklineBlock, createInitialArticles } from './initial'

describe('articleBonusAmount', () => {
  it('округляет дробный формульный дефолт до целого', () => {
    // (100 − 0) × 10.5% = 10.5 → 11
    const values: ArticleValues = { sales: 100, expense: 0, bonusPercent: 10.5 }
    expect(articleBonusAmount(values)).toBe(11)
    // (100 − 0) × 10.4% = 10.4 → 10 (округление к ближайшему, не всегда вверх)
    expect(articleBonusAmount({ sales: 100, expense: 0, bonusPercent: 10.4 })).toBe(10)
  })

  it('отрицательный формульный дефолт (расходы > продаж) превращает в 0', () => {
    // (100 − 500) × 50% = −200 → 0
    const values: ArticleValues = { sales: 100, expense: 500, bonusPercent: 50 }
    expect(articleBonusAmount(values)).toBe(0)
  })

  it('возвращает override руководителя как есть, не трогая его формулой', () => {
    // Даже если формула была бы отрицательной — override приоритетнее.
    const values: ArticleValues = {
      sales: 100,
      expense: 500,
      bonusPercent: 50,
      bonusAmount: 12_345,
    }
    expect(articleBonusAmount(values)).toBe(12_345)
  })

  it('override равный 0 остаётся 0 (не откатывается к формуле)', () => {
    const values: ArticleValues = { sales: 1_000, expense: 0, bonusPercent: 50, bonusAmount: 0 }
    expect(articleBonusAmount(values)).toBe(0)
  })

  it('нулевой процент даёт 0', () => {
    expect(articleBonusAmount({ sales: 1_000, expense: 0, bonusPercent: 0 })).toBe(0)
  })
})

describe('bonusTotal', () => {
  it('пустые статьи дают 0', () => {
    expect(bonusTotal(createInitialArticles())).toBe(0)
  })

  it('суммирует нормализованные бонусы: дробь округлена, отрицательная → 0, плюс override', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 100, expense: 0, bonusPercent: 10.5 } // 10.5 → 11
    articles.main.personnel = { sales: 100, expense: 500, bonusPercent: 50 } // −200 → 0
    articles.main.internet = { sales: 0, expense: 0, bonusPercent: 0, bonusAmount: 30 } // override 30
    expect(bonusTotal(articles)).toBe(41)
  })

  it('учитывает блок backline, когда он есть', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 1_000, expense: 0, bonusPercent: 50 } // 500
    articles.backline = createEmptyBacklineBlock()
    articles.backline.transport = { sales: 200, expense: 0, bonusPercent: 50 } // 100
    expect(bonusTotal(articles)).toBe(600)
  })
})
