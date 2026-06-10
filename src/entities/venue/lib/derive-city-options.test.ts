import { describe, expect, it } from 'vitest'

import type { VenueLoft } from '../model/types'
import { deriveCityOptionsFromLofts } from './derive-city-options'

function loft(city_label: string, id = 1): VenueLoft {
  return {
    id,
    plum_id: id,
    name: `Loft ${id}`,
    city: 1,
    city_label,
    synced_at: '2026-01-01T00:00:00Z',
  }
}

describe('deriveCityOptionsFromLofts', () => {
  it('returns unique sorted city labels', () => {
    expect(
      deriveCityOptionsFromLofts([
        loft('Казань', 1),
        loft('Москва', 2),
        loft('Москва', 3),
        loft('Санкт-Петербург', 4),
      ]),
    ).toEqual(['Казань', 'Москва', 'Санкт-Петербург'])
  })

  it('skips empty labels', () => {
    expect(deriveCityOptionsFromLofts([loft('   ', 1), loft('Москва', 2)])).toEqual(['Москва'])
  })
})
