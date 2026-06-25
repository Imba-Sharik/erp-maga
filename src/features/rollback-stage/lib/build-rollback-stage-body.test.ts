import { describe, expect, it } from 'vitest'

import { buildRollbackStageBody } from './build-rollback-stage-body'

describe('buildRollbackStageBody', () => {
  it('без даты — пустое тело (бэк сам определяет предыдущий этап)', () => {
    expect(buildRollbackStageBody()).toEqual({})
  })

  it('с датой — отдаёт event_date', () => {
    expect(buildRollbackStageBody({ eventDate: '2026-07-15' })).toEqual({
      event_date: '2026-07-15',
    })
  })

  it('пустая строка даты — пустое тело', () => {
    expect(buildRollbackStageBody({ eventDate: '' })).toEqual({})
  })
})
