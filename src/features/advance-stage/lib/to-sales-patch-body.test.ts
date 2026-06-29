import { describe, expect, it } from 'vitest'

import { createInitialArticles } from '@/entities/project-article'

import { buildSalesPatchBody } from './to-sales-patch-body'

describe('buildSalesPatchBody', () => {
  it('суммы продаж основного блока + единый % налога', () => {
    const articles = createInitialArticles()
    articles.main.equipment.sales = 1500000
    articles.main.sublease.sales = 80000

    expect(buildSalesPatchBody({ articles, taxRate: 10 })).toEqual({
      equipment: '1500000.00',
      subrent: '80000.00',
      contract_tax_percent: '10.00',
    })
  })

  it('% налога 0 отправляется (явный ноль), null — нет', () => {
    const articles = createInitialArticles()
    articles.main.equipment.sales = 1
    expect(buildSalesPatchBody({ articles, taxRate: 0 })).toMatchObject({
      contract_tax_percent: '0.00',
    })
    expect(buildSalesPatchBody({ articles, taxRate: null })).not.toHaveProperty(
      'contract_tax_percent',
    )
  })

  it('нечего сохранять → null', () => {
    expect(buildSalesPatchBody({ articles: createInitialArticles(), taxRate: null })).toBeNull()
  })
})
