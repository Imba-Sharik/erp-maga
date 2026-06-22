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
      plumEventStatus: [],
      city: '1,2',
    })
    expect(params).toMatchObject({ ...base, city: '1,2' })
  })

  it('опускает city при пустом/нулевом значении', () => {
    expect(
      buildKanbanListParams(base, { search: '', plumEventStatus: [], city: null }),
    ).not.toHaveProperty('city')
    expect(
      buildKanbanListParams(base, { search: '', plumEventStatus: [], city: '' }),
    ).not.toHaveProperty('city')
  })

  it('тримит search и опускает пустой', () => {
    expect(buildKanbanListParams(base, { search: '  фото  ', plumEventStatus: [] }).search).toBe(
      'фото',
    )
    expect(buildKanbanListParams(base, { search: '   ', plumEventStatus: [] })).not.toHaveProperty(
      'search',
    )
  })

  it('пробрасывает hall_id и loft_id, когда заданы', () => {
    const params = buildKanbanListParams(base, {
      search: '',
      plumEventStatus: [],
      hall_id: 11,
      loft_id: 2,
    })
    expect(params).toMatchObject({ hall_id: 11, loft_id: 2 })
  })

  it('пробрасывает один статус Plum через plum_event_status', () => {
    const params = buildKanbanListParams(base, {
      search: '',
      plumEventStatus: ['4'],
    })
    expect(params).toMatchObject({ plum_event_status: 4 })
    expect(params).not.toHaveProperty('plum_event_status__in')
  })

  it('пробрасывает несколько статусов Plum через plum_event_status__in', () => {
    const params = buildKanbanListParams(base, {
      search: '',
      plumEventStatus: ['4', '6', '10'],
    })
    expect(params).toMatchObject({ plum_event_status__in: '4,6,10' })
    expect(params).not.toHaveProperty('plum_event_status')
  })

  it('опускает параметры Plum при пустом фильтре', () => {
    const params = buildKanbanListParams(base, { search: '', plumEventStatus: [] })
    expect(params).not.toHaveProperty('plum_event_status')
    expect(params).not.toHaveProperty('plum_event_status__in')
  })
})
