import { describe, expect, it } from 'vitest'

import {
  buildFilteredHallGroups,
  buildHallAssignmentGroups,
  buildLoftAssignmentOptions,
} from './build-assignment-options'
import type { VenueHall, VenueLoft } from '../model/types'

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

// Loft 1: halls 10, 11 | Loft 2: hall 20
const halls: VenueHall[] = [hall(10, 1), hall(11, 1), hall(20, 2)]
const lofts: VenueLoft[] = [loft(2, 'Beta'), loft(1, 'Alpha')]

describe('buildLoftAssignmentOptions', () => {
  it('сортирует по имени и использует id как key', () => {
    expect(buildLoftAssignmentOptions(lofts)).toEqual([
      { key: '1', label: 'Alpha' },
      { key: '2', label: 'Beta' },
    ])
  })
})

describe('buildHallAssignmentGroups', () => {
  it('показывает только залы выбранных лофтов, сгруппированные по лофту', () => {
    expect(buildHallAssignmentGroups(halls, lofts, [1])).toEqual([
      {
        label: 'Alpha',
        options: [
          { key: '10', label: 'Hall 10' },
          { key: '11', label: 'Hall 11' },
        ],
      },
    ])
  })

  it('сортирует лофты по имени', () => {
    const groups = buildHallAssignmentGroups(halls, lofts, [1, 2])
    expect(groups.map((g) => g.label)).toEqual(['Alpha', 'Beta'])
  })

  it('пустой список при отсутствии выбранных лофтов', () => {
    expect(buildHallAssignmentGroups(halls, lofts, [])).toEqual([])
  })
})

describe('buildFilteredHallGroups', () => {
  it('выводит лофты из выбранных залов и фильтрует группы', () => {
    // hall 10 → лофт 1; hall 20 не выбран → группа только Alpha
    expect(buildFilteredHallGroups(halls, lofts, [10])).toEqual([
      {
        label: 'Alpha',
        options: [
          { key: '10', label: 'Hall 10' },
          { key: '11', label: 'Hall 11' },
        ],
      },
    ])
  })

  it('частичный выбор залов лофта всё равно показывает все залы лофта в селекте', () => {
    const groups = buildFilteredHallGroups(halls, lofts, [10, 20])
    expect(groups).toHaveLength(2)
    expect(groups[0].options.map((o) => o.key)).toEqual(['10', '11'])
    expect(groups[1].options.map((o) => o.key)).toEqual(['20'])
  })

  it('закреплённый зал с loft=null попадает в группу «Без лофта»', () => {
    const withOrphan: VenueHall[] = [...halls, hall(30, null, 'Зал без лофта')]
    const groups = buildFilteredHallGroups(withOrphan, lofts, [10, 30])
    expect(groups).toHaveLength(2)
    expect(groups[0].label).toBe('Alpha')
    const noLoft = groups[groups.length - 1]
    expect(noLoft).toEqual({ label: 'Без лофта', options: [{ key: '30', label: 'Зал без лофта' }] })
  })

  it('зал-сирота вне каталога подписывается из fallbackHallNames', () => {
    const groups = buildFilteredHallGroups(
      halls,
      lofts,
      [10, 999],
      new Map([[999, 'Сиротский зал']]),
    )
    const noLoft = groups[groups.length - 1]
    expect(noLoft).toEqual({
      label: 'Без лофта',
      options: [{ key: '999', label: 'Сиротский зал' }],
    })
  })

  it('зал-сирота без имени показывается как «Зал #id»', () => {
    expect(buildFilteredHallGroups(halls, lofts, [999])).toEqual([
      { label: 'Без лофта', options: [{ key: '999', label: 'Зал #999' }] },
    ])
  })

  it('не добавляет группу «Без лофта», если все выбранные залы покрыты лофтами', () => {
    const groups = buildFilteredHallGroups(halls, lofts, [10, 20])
    expect(groups.some((g) => g.label === 'Без лофта')).toBe(false)
  })
})
