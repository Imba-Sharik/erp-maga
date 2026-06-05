import { describe, expect, it } from 'vitest'

import { createInitialArticles } from '@/entities/project-articles'

import {
  financeAspectForStage,
  prepareArticlesForStage,
  prepareTaxRateForStage,
} from './prepare-articles-for-stage'

describe('financeAspectForStage', () => {
  it('сопоставляет ready_to_event с sales', () => {
    expect(financeAspectForStage('ready_to_event')).toBe('sales')
  })

  it('сопоставляет expenses_entered с expense', () => {
    expect(financeAspectForStage('expenses_entered')).toBe('expense')
  })

  it('возвращает null для нефинансовых этапов', () => {
    expect(financeAspectForStage('plum_request')).toBeNull()
    expect(financeAspectForStage('bonus_calculated')).toBeNull()
  })
})

describe('prepareArticlesForStage', () => {
  it('на ready_to_event обнуляет sales=0, не трогая expense', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 0, expense: 500, bonusPercent: 10 }

    const result = prepareArticlesForStage(articles, 'ready_to_event')

    expect(result.main.equipment.sales).toBeNull()
    expect(result.main.equipment.expense).toBe(500)
  })

  it('на expenses_entered обнуляет expense=0, не трогая sales', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 1000, expense: 0, bonusPercent: 10 }

    const result = prepareArticlesForStage(articles, 'expenses_entered')

    expect(result.main.equipment.sales).toBe(1000)
    expect(result.main.equipment.expense).toBeNull()
  })

  it('на нефинансовом этапе не меняет статьи', () => {
    const articles = createInitialArticles()
    articles.main.equipment = { sales: 0, expense: 0, bonusPercent: 10 }

    const result = prepareArticlesForStage(articles, 'contract_signed')

    expect(result.main.equipment.sales).toBe(0)
    expect(result.main.equipment.expense).toBe(0)
  })
})

describe('prepareTaxRateForStage', () => {
  it('бэковый 0 на ready_to_event превращает в null', () => {
    expect(prepareTaxRateForStage(0, 'ready_to_event')).toBeNull()
  })

  it('undefined на ready_to_event превращает в null', () => {
    expect(prepareTaxRateForStage(undefined, 'ready_to_event')).toBeNull()
  })

  it('ненулевое значение на ready_to_event сохраняет', () => {
    expect(prepareTaxRateForStage(15, 'ready_to_event')).toBe(15)
  })

  it('на других этапах оставляет значение как есть, включая 0', () => {
    expect(prepareTaxRateForStage(0, 'expenses_entered')).toBe(0)
    expect(prepareTaxRateForStage(10, 'expenses_entered')).toBe(10)
  })

  it('на других этапах undefined приводит к null', () => {
    expect(prepareTaxRateForStage(undefined, 'expenses_entered')).toBeNull()
  })

  it('сохраняет явный 0 при уходе с ready_to_event', () => {
    expect(prepareTaxRateForStage(0, 'event_held')).toBe(0)
  })
})
