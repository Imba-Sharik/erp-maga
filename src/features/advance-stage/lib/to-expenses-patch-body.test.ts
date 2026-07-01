import { describe, expect, it } from 'vitest'

import { createEmptyBacklineBlock, createInitialArticles } from '@/entities/project-article'

import { buildExpensesPatchBody } from './to-expenses-patch-body'

describe('buildExpensesPatchBody', () => {
  it('суммы расходов основного блока', () => {
    const articles = createInitialArticles()
    articles.main.equipment.expense = 800000
    articles.main.sublease.expense = 40000

    expect(buildExpensesPatchBody({ articles })).toEqual({
      equipment: '800000.00',
      subrent: '40000.00',
    })
  })

  it('комментарий к расходам (postEventComment) попадает в comment', () => {
    const articles = createInitialArticles()
    articles.main.equipment.expense = 1
    expect(
      buildExpensesPatchBody({ articles, values: { postEventComment: 'превышение' } }),
    ).toMatchObject({ comment: 'превышение' })
  })

  it('бэклайн-расходы уходят вложенным объектом backline', () => {
    const articles = createInitialArticles()
    articles.backline = createEmptyBacklineBlock()
    articles.backline.equipment.expense = 50000
    articles.backline.sublease.expense = 12000

    expect(buildExpensesPatchBody({ articles })).toEqual({
      backline: { equipment: '50000.00', subrent: '12000.00' },
    })
  })

  it('нечего сохранять → null', () => {
    expect(buildExpensesPatchBody({ articles: createInitialArticles() })).toBeNull()
  })
})
