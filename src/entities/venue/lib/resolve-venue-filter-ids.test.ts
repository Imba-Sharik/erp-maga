import { describe, expect, it } from 'vitest'

import type { VenueHall, VenueLoft } from '../model/types'
import { resolveVenueFilterIds } from './resolve-venue-filter-ids'

const lofts = [
  { id: 1, plum_id: 10, name: 'Loft A', synced_at: '' },
  { id: 2, plum_id: 20, name: 'Loft B', synced_at: '' },
] as unknown as VenueLoft[]

const halls = [
  {
    id: 10,
    plum_id: 100,
    name: 'Hall 1',
    loft: { id: 1, plum_id: 10, name: 'Loft A' },
    synced_at: '',
  },
  {
    id: 11,
    plum_id: 101,
    name: 'Hall 2',
    loft: { id: 2, plum_id: 20, name: 'Loft B' },
    synced_at: '',
  },
] as unknown as VenueHall[]

describe('resolveVenueFilterIds', () => {
  it('maps loft and hall names to ids', () => {
    expect(resolveVenueFilterIds('Loft A', 'Hall 2', halls, lofts)).toEqual({
      loft_id: 1,
      hall_id: 11,
    })
  })

  it('omits unknown names', () => {
    expect(resolveVenueFilterIds('Unknown', null, halls, lofts)).toEqual({})
    expect(resolveVenueFilterIds(null, 'Unknown', halls, lofts)).toEqual({})
  })

  it('returns empty object when both filters are null', () => {
    expect(resolveVenueFilterIds(null, null, halls, lofts)).toEqual({})
  })
})
