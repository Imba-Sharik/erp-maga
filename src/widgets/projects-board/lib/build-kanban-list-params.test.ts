import { describe, expect, it } from 'vitest'

import { buildKanbanListParams } from './build-kanban-list-params'

const base = {
  event_date_after: '2024-01-01',
  event_date_before: '2024-01-31',
  ordering: 'event_date',
} as const

describe('buildKanbanListParams', () => {
  it('пробрасывает серверный фильтр города (city)', () => {
    const params = buildKanbanListParams(base, {
      search: '',
      plumEventStatus: null,
      city: '1,2',
    })
    expect(params).toMatchObject({ ...base, city: '1,2' })
  })

  it('опускает city при пустом/нулевом значении', () => {
    expect(
      buildKanbanListParams(base, { search: '', plumEventStatus: null, city: null }),
    ).not.toHaveProperty('city')
    expect(
      buildKanbanListParams(base, { search: '', plumEventStatus: null, city: '' }),
    ).not.toHaveProperty('city')
  })

  it('тримит search и опускает пустой', () => {
    expect(buildKanbanListParams(base, { search: '  фото  ', plumEventStatus: null }).search).toBe(
      'фото',
    )
    expect(
      buildKanbanListParams(base, { search: '   ', plumEventStatus: null }),
    ).not.toHaveProperty('search')
  })

  it('пробрасывает hall_id и loft_id, когда заданы', () => {
    const params = buildKanbanListParams(base, {
      search: '',
      plumEventStatus: null,
      hall_id: 11,
      loft_id: 2,
    })
    expect(params).toMatchObject({ hall_id: 11, loft_id: 2 })
  })
})
