import { describe, expect, it } from 'vitest'

import { createInitialArticles } from '@/entities/project-article'

import { ARTICLE_KIND_TO_API, blockAspectToDecimals, toDecimalString } from './articles-to-decimals'

describe('toDecimalString', () => {
  it('число → строка с двумя знаками', () => {
    expect(toDecimalString(1500000)).toBe('1500000.00')
    expect(toDecimalString(0)).toBe('0.00')
    expect(toDecimalString(10.5)).toBe('10.50')
  })

  it('null/undefined/невалид → undefined', () => {
    expect(toDecimalString(null)).toBeUndefined()
    expect(toDecimalString(undefined)).toBeUndefined()
    expect(toDecimalString(Number.NaN)).toBeUndefined()
  })
})

describe('ARTICLE_KIND_TO_API', () => {
  it('маппит sublease → subrent, остальное 1:1', () => {
    expect(ARTICLE_KIND_TO_API.sublease).toBe('subrent')
    expect(ARTICLE_KIND_TO_API.equipment).toBe('equipment')
    expect(ARTICLE_KIND_TO_API.tm).toBe('tm')
  })
})

describe('blockAspectToDecimals', () => {
  it('заполненные статьи → apiKey:decimal, незаполненные пропущены', () => {
    const articles = createInitialArticles()
    articles.main.equipment.sales = 1500000
    articles.main.sublease.sales = 80000
    // personnel.sales остаётся null → не попадает в тело

    expect(blockAspectToDecimals(articles.main, 'sales')).toEqual({
      equipment: '1500000.00',
      subrent: '80000.00',
    })
  })

  it('аспект expense берёт суммы расходов', () => {
    const articles = createInitialArticles()
    articles.main.equipment.expense = 800000
    expect(blockAspectToDecimals(articles.main, 'expense')).toEqual({
      equipment: '800000.00',
    })
  })

  it('пустой блок → пустой объект', () => {
    expect(blockAspectToDecimals(createInitialArticles().main, 'sales')).toEqual({})
  })
})
