import { describe, expect, it } from 'vitest'

import type { ProjectStage } from '@/entities/project'
import { createInitialArticles } from '@/entities/project-article'

import { isStagePatchable, STAGE_PATCH_ADAPTERS } from './stage-patch-registry'

describe('isStagePatchable (Фаза 1)', () => {
  it('маршруты есть у клиента (заявки), договора, продаж и расходов', () => {
    for (const stage of [
      'plum_request',
      'contract_signed',
      'ready_to_event',
      'expenses_entered',
    ] as ProjectStage[]) {
      expect(isStagePatchable(stage)).toBe(true)
    }
  })

  it('этапы без серверной ручки пока непатчабельны', () => {
    for (const stage of [
      'primary_contact_done',
      'calculation_prepared',
      'event_held',
      'documents_confirmed',
      'bonus_calculated',
      'closed',
    ] as ProjectStage[]) {
      expect(isStagePatchable(stage)).toBe(false)
    }
  })
})

describe('STAGE_PATCH_ADAPTERS.buildBody', () => {
  it('ready_to_event собирает тело из articles/taxRate', () => {
    const articles = createInitialArticles()
    articles.main.equipment.sales = 1000
    const body = STAGE_PATCH_ADAPTERS.ready_to_event?.buildBody({
      values: {},
      articles,
      taxRate: 5,
    })
    expect(body).toMatchObject({ equipment: '1000.00', contract_tax_percent: '5.00' })
  })

  it('contract_signed собирает тело из values', () => {
    const body = STAGE_PATCH_ADAPTERS.contract_signed?.buildBody({
      values: { contractNumber: 'A-1' },
      articles: createInitialArticles(),
      taxRate: null,
    })
    expect(body).toMatchObject({ contract_number: 'A-1' })
  })

  it('plum_request собирает тело клиента из magComment', () => {
    const body = STAGE_PATCH_ADAPTERS.plum_request?.buildBody({
      values: { magComment: 'перезвонить' },
      articles: createInitialArticles(),
      taxRate: null,
    })
    expect(body).toMatchObject({ mag_comment: 'перезвонить' })
  })
})
