import { describe, expect, it } from 'vitest'

import type { VenueHall } from '@/entities/venue'

import { resolvePrimaryHallVenueIds } from './resolve-primary-hall-venue-ids'

describe('resolvePrimaryHallVenueIds', () => {
  const halls: VenueHall[] = [
    {
      id: 10,
      plum_id: 100,
      name: 'Зал 1',
      loft: { id: 2, plum_id: 20, name: 'Loft A', city: 1 },
      synced_at: '',
    },
    { id: 11, plum_id: 101, name: 'Зал 2', loft: null, synced_at: '' },
  ]

  it('возвращает undefined без залов', () => {
    expect(resolvePrimaryHallVenueIds([], halls)).toBeUndefined()
  })

  it('берёт первый зал как primary и подставляет loft_id', () => {
    expect(resolvePrimaryHallVenueIds(['10', '11'], halls)).toEqual({
      hallId: 10,
      loftId: 2,
    })
  })

  it('не добавляет loft_id, если у primary зала нет лофта', () => {
    expect(resolvePrimaryHallVenueIds(['11'], halls)).toEqual({ hallId: 11 })
  })
})
