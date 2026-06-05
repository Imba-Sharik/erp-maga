import { describe, expect, it } from 'vitest'

import { createEmptyBacklineBlock, createInitialArticles } from './initial'
import { normalizeAspectZeroToNull } from './normalize'

describe('normalizeAspectZeroToNull', () => {
  it('заменяет 0 на null только для указанного аспекта в main', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 0, expense: 500, bonusPercent: 10 }
    articles.main.personnel = { sales: 100_000, expense: 0, bonusPercent: 5 }

    const result = normalizeAspectZeroToNull(articles, 'sales')

    expect(result.main.equipment.sales).toBeNull()
    expect(result.main.equipment.expense).toBe(500)
    expect(result.main.personnel.sales).toBe(100_000)
    expect(result.main.personnel.expense).toBe(0)
  })

  it('нормализует expense, не трогая sales', () => {
    const articles = createInitialArticles()
    articles.main.transport = { sales: 0, expense: 0, bonusPercent: 3 }

    const result = normalizeAspectZeroToNull(articles, 'expense')

    expect(result.main.transport.sales).toBe(0)
    expect(result.main.transport.expense).toBeNull()
  })

  it('обрабатывает бэклайн, если блок добавлен', () => {
    const articles = createInitialArticles()
    articles.backline = createEmptyBacklineBlock()
    articles.backline.equipment = { sales: 0, expense: 0, bonusPercent: 4 }

    const result = normalizeAspectZeroToNull(articles, 'sales')

    expect(result.backline?.equipment.sales).toBeNull()
    expect(result.backline?.equipment.expense).toBe(0)
  })

  it('не меняет articles, если backline отсутствует', () => {
    const articles = createInitialArticles()

    const result = normalizeAspectZeroToNull(articles, 'sales')

    expect(result.backline).toBeNull()
  })

  it('сохраняет явный ненулевой ввод', () => {
    const articles = createInitialArticles()
    articles.main.internet = { sales: 0, expense: 0, bonusPercent: 1 }

    const result = normalizeAspectZeroToNull(articles, 'sales')

    expect(result.main.internet.sales).toBeNull()
  })

  it('не мутирует исходный объект', () => {
    const articles = createInitialArticles()
    articles.main.tm = { sales: 0, expense: 0, bonusPercent: 2 }

    normalizeAspectZeroToNull(articles, 'sales')

    expect(articles.main.tm.sales).toBe(0)
  })
})
