import { describe, expect, it } from 'vitest'

import { ROLLBACK_TRANSITION_READY, buildRollbackStageBody } from './build-rollback-stage-body'

describe('buildRollbackStageBody', () => {
  it('флаг готовности выключен, пока бэк не подтвердил контракт', () => {
    // Защита от случайного включения реального запроса до согласования с бэком.
    expect(ROLLBACK_TRANSITION_READY).toBe(false)
  })

  it('собирает target_stage предыдущего этапа', () => {
    expect(buildRollbackStageBody({ stage: 'event_held' })).toEqual({
      to_stage: 'rollback_to_previous',
      payload: { target_stage: 'ready_to_event' },
    })
  })

  it('добавляет event_date, когда передана', () => {
    expect(buildRollbackStageBody({ stage: 'event_held' }, { eventDate: '2026-06-01' })).toEqual({
      to_stage: 'rollback_to_previous',
      payload: { target_stage: 'ready_to_event', event_date: '2026-06-01' },
    })
  })

  it('не добавляет event_date для пустой строки', () => {
    expect(buildRollbackStageBody({ stage: 'expenses_entered' }, { eventDate: '' })).toEqual({
      to_stage: 'rollback_to_previous',
      payload: { target_stage: 'event_held' },
    })
  })

  it('бросает для первого этапа (нет предыдущего)', () => {
    expect(() => buildRollbackStageBody({ stage: 'plum_request' })).toThrow()
  })
})
