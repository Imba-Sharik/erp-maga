import { describe, expect, it } from 'vitest'

import { getPreviousStage } from './get-previous-stage'

describe('getPreviousStage', () => {
  it('первый этап воронки → null', () => {
    expect(getPreviousStage('plum_request')).toBeNull()
  })

  it('середина предпроектной воронки → предыдущий', () => {
    expect(getPreviousStage('calculation_prepared')).toBe('primary_contact_done')
  })

  it('event_held → ready_to_event (стык воронок)', () => {
    expect(getPreviousStage('event_held')).toBe('ready_to_event')
  })

  it('закрывающий этап → предыдущий закрывающий', () => {
    expect(getPreviousStage('expenses_entered')).toBe('event_held')
    expect(getPreviousStage('closed')).toBe('bonus_approved')
  })

  it('out_of_mag_scope (вне ALL_STAGE_ORDER) → null', () => {
    expect(getPreviousStage('out_of_mag_scope')).toBeNull()
  })

  it('archived → closed (последний в порядке)', () => {
    expect(getPreviousStage('archived')).toBe('closed')
  })
})
