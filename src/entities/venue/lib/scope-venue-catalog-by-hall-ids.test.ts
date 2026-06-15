import { describe, expect, it } from 'vitest'

import type { VenueHall, VenueLoft } from '../model/types'

import { scopeVenueCatalogByHallIds } from './scope-venue-catalog-by-hall-ids'

function hall(id: number, loftId: number | null, name = `Hall ${id}`): VenueHall {
  return {
    id,
    plum_id: id,
    name,
    loft: loftId == null ? null : { id: loftId, plum_id: loftId, name: `Loft ${loftId}` },
    synced_at: '2024-01-01T00:00:00Z',
  } as VenueHall
}

function loft(id: number, name = `Loft ${id}`): VenueLoft {
  return { id, plum_id: id, name, synced_at: '2024-01-01T00:00:00Z' } as VenueLoft
}

const halls: VenueHall[] = [hall(10, 1), hall(11, 1), hall(20, 2), hall(30, null)]
const lofts: VenueLoft[] = [loft(1), loft(2)]

describe('scopeVenueCatalogByHallIds', () => {
  it('undefined — возвращает полный каталог', () => {
    const result = scopeVenueCatalogByHallIds(halls, lofts, undefined)
    expect(result.halls).toEqual(halls)
    expect(result.lofts).toEqual(lofts)
  })

  it('[] — пустые списки', () => {
    const result = scopeVenueCatalogByHallIds(halls, lofts, [])
    expect(result.halls).toEqual([])
    expect(result.lofts).toEqual([])
  })

  it('залы одного лофта — один лофт в результате', () => {
    const result = scopeVenueCatalogByHallIds(halls, lofts, [10, 11])
    expect(result.halls.map((h) => h.id)).toEqual([10, 11])
    expect(result.lofts.map((l) => l.id)).toEqual([1])
  })

  it('зал без лофта — зал есть, лофт не попадает', () => {
    const result = scopeVenueCatalogByHallIds(halls, lofts, [30])
    expect(result.halls.map((h) => h.id)).toEqual([30])
    expect(result.lofts).toEqual([])
  })

  it('неизвестный id зала — игнорируется', () => {
    const result = scopeVenueCatalogByHallIds(halls, lofts, [999, 10])
    expect(result.halls.map((h) => h.id)).toEqual([10])
    expect(result.lofts.map((l) => l.id)).toEqual([1])
  })
})
