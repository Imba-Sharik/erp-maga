import { describe, expect, it } from 'vitest'

import { createInitialArticles } from '@/entities/project-article'

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

  it('нечего сохранять → null', () => {
    expect(buildExpensesPatchBody({ articles: createInitialArticles() })).toBeNull()
  })
})
