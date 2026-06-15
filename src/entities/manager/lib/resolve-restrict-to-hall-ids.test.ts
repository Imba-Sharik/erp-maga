import { describe, expect, it } from 'vitest'

import type { Manager } from '../model/types'

import { resolveRestrictToHallIds } from './resolve-restrict-to-hall-ids'

const managers: Manager[] = [
  {
    id: '5',
    fullName: 'Иван Иванов',
    assignments: [
      {
        id: 1,
        hallId: 10,
        hallName: 'Зал 1',
        loftId: 1,
        loftName: 'Loft A',
        label: 'Loft A — Зал 1',
      },
      { id: 2, hallId: 20, hallName: 'Зал 2', loftId: null, loftName: null, label: 'Зал 2' },
    ],
    lofts: ['Loft A'],
    halls: ['Зал 1', 'Зал 2'],
    activeProjectsCount: 0,
    closedProjectsCount: 0,
    salesTotal: 0,
    bonusTotal: 0,
  },
  {
    id: '7',
    fullName: 'Без назначений',
    assignments: [],
    lofts: [],
    halls: [],
    activeProjectsCount: 0,
    closedProjectsCount: 0,
    salesTotal: 0,
    bonusTotal: 0,
  },
]

describe('resolveRestrictToHallIds', () => {
  it('undefined при отсутствии managerId', () => {
    expect(resolveRestrictToHallIds(null, managers)).toBeUndefined()
    expect(resolveRestrictToHallIds(undefined, managers)).toBeUndefined()
  })

  it('undefined при enabled: false', () => {
    expect(resolveRestrictToHallIds('5', managers, { enabled: false })).toBeUndefined()
  })

  it('id залов из assignments выбранного менеджера', () => {
    expect(resolveRestrictToHallIds('5', managers)).toEqual([10, 20])
  })

  it('[] для менеджера без назначений', () => {
    expect(resolveRestrictToHallIds('7', managers)).toEqual([])
  })

  it('[] для неизвестного id', () => {
    expect(resolveRestrictToHallIds('999', managers)).toEqual([])
  })
})
