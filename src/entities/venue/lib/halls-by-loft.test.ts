import { describe, expect, it } from 'vitest'

import type { VenueHall, VenueLoft } from '../model/types'
import { hallBelongsToLoft, hallsForLoft } from './halls-by-loft'

const lofts = [
  { id: 1, plum_id: 10, name: 'THE BIRCH', synced_at: '' },
  { id: 2, plum_id: 20, name: 'Loft Центр', synced_at: '' },
] as unknown as VenueLoft[]

const halls = [
  { id: 1, plum_id: 100, name: 'AMBERWOOD HOUSE', loft: { id: 1, plum_id: 10, name: 'THE BIRCH' }, synced_at: '' },
  { id: 2, plum_id: 101, name: 'MANGO HOUSE', loft: { id: 1, plum_id: 10, name: 'THE BIRCH' }, synced_at: '' },
  { id: 3, plum_id: 102, name: 'Летняя сцена', loft: { id: 2, plum_id: 20, name: 'Loft Центр' }, synced_at: '' },
  { id: 4, plum_id: 103, name: 'Без лофта', loft: null, synced_at: '' },
] as unknown as VenueHall[]

describe('hallsForLoft', () => {
  it('по loft.id оставляет только залы выбранного лофта', () => {
    const result = hallsForLoft(halls, lofts, 'THE BIRCH')
    expect(result.map((h) => h.name)).toEqual(['AMBERWOOD HOUSE', 'MANGO HOUSE'])
  })

  it('пустой результат для лофта без залов', () => {
    expect(hallsForLoft(halls, [], 'Неизвестный')).toHaveLength(0)
  })
})

describe('hallBelongsToLoft', () => {
  it('true для зала своего лофта', () => {
    expect(hallBelongsToLoft(halls, lofts, 'MANGO HOUSE', 'THE BIRCH')).toBe(true)
  })

  it('false для зала чужого лофта', () => {
    expect(hallBelongsToLoft(halls, lofts, 'Летняя сцена', 'THE BIRCH')).toBe(false)
  })
})
