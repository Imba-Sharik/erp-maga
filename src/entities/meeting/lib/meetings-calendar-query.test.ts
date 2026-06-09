import { describe, expect, it } from 'vitest'

import { listMeetingsParamsToApi } from './meetings-calendar-query'

describe('listMeetingsParamsToApi', () => {
  it('маппит диапазон дат и менеджера', () => {
    expect(
      listMeetingsParamsToApi({
        dateFrom: '2026-05-26',
        dateTo: '2026-07-06',
        managerId: 5,
      }),
    ).toEqual({
      date_after: '2026-05-26',
      date_before: '2026-07-06',
      manager: 5,
    })
  })

  it('не передаёт manager при null', () => {
    expect(
      listMeetingsParamsToApi({
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
        managerId: null,
      }),
    ).toEqual({
      date_after: '2026-06-01',
      date_before: '2026-06-30',
    })
  })
})
