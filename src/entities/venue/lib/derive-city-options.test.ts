import { describe, expect, it } from 'vitest'

import type { VenueLoft } from '../model/types'
import { deriveCityOptionsFromLofts } from './derive-city-options'

function loft(cityId: number, cityLabel: string, id = cityId): VenueLoft {
  return {
    id,
    plum_id: id,
    name: `Loft ${id}`,
    city: cityId,
    city_label: cityLabel,
    synced_at: '2026-01-01T00:00:00Z',
  }
}

describe('deriveCityOptionsFromLofts', () => {
  it('returns unique options sorted by label, deduped by city id', () => {
    expect(
      deriveCityOptionsFromLofts([
        loft(3, 'МО', 1),
        loft(1, 'Москва', 2),
        loft(1, 'Москва', 3),
        loft(2, 'Санкт-Петербург', 4),
      ]),
    ).toEqual([
      { value: '3', label: 'МО' },
      { value: '1', label: 'Москва' },
      { value: '2', label: 'Санкт-Петербург' },
    ])
  })

  it('skips lofts with empty label or null city', () => {
    const noCity: VenueLoft = {
      id: 10,
      plum_id: 10,
      name: 'Loft 10',
      city: null,
      city_label: 'Тверь',
      synced_at: '2026-01-01T00:00:00Z',
    }
    expect(deriveCityOptionsFromLofts([loft(1, '   ', 1), noCity, loft(2, 'Москва', 2)])).toEqual([
      { value: '2', label: 'Москва' },
    ])
  })
})
