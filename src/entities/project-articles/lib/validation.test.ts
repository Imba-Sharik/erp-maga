import { describe, expect, it } from 'vitest'

import { BACKLINE_ARTICLE_KINDS, MAIN_ARTICLE_KINDS } from '../model/types'
import { createEmptyBacklineBlock, createInitialArticles } from './initial'
import { areFinanceAspectFieldsFilled, listUnfilledFinanceAspectFields } from './validation'

function fillMainAspect(
  articles: ReturnType<typeof createInitialArticles>,
  aspect: 'sales' | 'expense',
  value: number | null,
) {
  for (const kind of MAIN_ARTICLE_KINDS) {
    articles.main[kind] = { ...articles.main[kind], [aspect]: value }
  }
}

describe('areFinanceAspectFieldsFilled', () => {
  it('false, если хотя бы одна main-статья sales = null', () => {
    const articles = createInitialArticles()
    fillMainAspect(articles, 'sales', 10_000)
    articles.main.internet = { ...articles.main.internet, sales: null }

    expect(areFinanceAspectFieldsFilled(articles, 'sales')).toBe(false)
  })

  it('true, если все main-статьи sales заполнены, включая явный 0', () => {
    const articles = createInitialArticles()
    fillMainAspect(articles, 'sales', 10_000)
    articles.main.screen = { ...articles.main.screen, sales: 0 }

    expect(areFinanceAspectFieldsFilled(articles, 'sales')).toBe(true)
  })

  it('false, если бэклайн добавлен и в нём есть null по expense', () => {
    const articles = createInitialArticles()
    fillMainAspect(articles, 'sales', 1)
    fillMainAspect(articles, 'expense', 100)
    articles.backline = createEmptyBacklineBlock()
    articles.backline.tm = { ...articles.backline.tm, expense: null }

    expect(areFinanceAspectFieldsFilled(articles, 'expense')).toBe(false)
  })

  it('true, если бэклайн добавлен и все expense заполнены', () => {
    const articles = createInitialArticles()
    fillMainAspect(articles, 'expense', 50)
    articles.backline = createEmptyBacklineBlock()
    for (const kind of BACKLINE_ARTICLE_KINDS) {
      articles.backline[kind] = { ...articles.backline[kind], expense: 0 }
    }

    expect(areFinanceAspectFieldsFilled(articles, 'expense')).toBe(true)
  })

  it('true без бэклайна, если main полностью заполнен', () => {
    const articles = createInitialArticles()
    fillMainAspect(articles, 'sales', 0)

    expect(areFinanceAspectFieldsFilled(articles, 'sales')).toBe(true)
    expect(articles.backline).toBeNull()
  })
})

describe('listUnfilledFinanceAspectFields', () => {
  it('возвращает все main-статьи с null по sales', () => {
    const articles = createInitialArticles()

    const missing = listUnfilledFinanceAspectFields(articles, 'sales')

    expect(missing).toHaveLength(MAIN_ARTICLE_KINDS.length)
    expect(missing.every((item) => item.block === 'main')).toBe(true)
  })

  it('не включает заполненные статьи', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { ...articles.main.equipment, sales: 1000 }
    articles.main.personnel = { ...articles.main.personnel, sales: 0 }

    const missing = listUnfilledFinanceAspectFields(articles, 'sales')

    expect(missing.map((item) => item.kind)).not.toContain('equipment')
    expect(missing.map((item) => item.kind)).not.toContain('personnel')
  })

  it('включает backline-статьи, если блок добавлен', () => {
    const articles = createInitialArticles()
    fillMainAspect(articles, 'expense', 100)
    articles.backline = createEmptyBacklineBlock()

    const missing = listUnfilledFinanceAspectFields(articles, 'expense')

    expect(missing.some((item) => item.block === 'backline')).toBe(true)
  })
})
