import { describe, expect, it } from 'vitest'

import { listMeetingsParamsToApi } from './meetings-calendar-query'

describe('listMeetingsParamsToApi', () => {
  it('маппит диапазон дат и список менеджеров', () => {
    expect(
      listMeetingsParamsToApi({
        dateFrom: '2026-05-26',
        dateTo: '2026-07-06',
        managerIds: [5, 7],
      }),
    ).toEqual({
      date_after: '2026-05-26',
      date_before: '2026-07-06',
      manager: [5, 7],
    })
  })

  it('не передаёт manager при пустом списке', () => {
    expect(
      listMeetingsParamsToApi({
        dateFrom: '2026-06-01',
        dateTo: '2026-06-30',
        managerIds: [],
      }),
    ).toEqual({
      date_after: '2026-06-01',
      date_before: '2026-06-30',
    })
  })
})
