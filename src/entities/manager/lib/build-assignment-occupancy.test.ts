import { describe, expect, it } from 'vitest'

import { hallOnlyAssignmentKey, loftAssignmentKey } from './assignment-keys'
import { buildAssignmentOccupancy } from './build-assignment-occupancy'
import type { Manager } from '../model/types'

function manager(id: string, fullName: string, assignments: Manager['assignments']): Manager {
  return {
    id,
    fullName,
    assignments,
    lofts: [],
    halls: [],
    activeProjectsCount: 0,
    closedProjectsCount: 0,
    salesTotal: 0,
    bonusTotal: 0,
  }
}

describe('buildAssignmentOccupancy', () => {
  const managers: Manager[] = [
    manager('1', 'Иванов', [
      {
        id: 10,
        hallId: 100,
        hallName: 'Зал 1',
        loftId: 2,
        loftName: 'Loft A',
        label: 'Loft A — Зал 1',
      },
      {
        id: 11,
        hallId: 200,
        hallName: 'Зал 2',
        loftId: null,
        loftName: null,
        label: 'Зал 2',
      },
    ]),
    manager('2', 'Петров', [
      {
        id: 20,
        hallId: 300,
        hallName: 'Зал 3',
        loftId: 5,
        loftName: 'Loft B',
        label: 'Loft B — Зал 3',
      },
    ]),
  ]

  it('lofts: собирает loft-ключи других менеджеров', () => {
    const map = buildAssignmentOccupancy(managers, '2', 'lofts')

    expect(map.get(loftAssignmentKey(100, 2))).toEqual({
      managerId: '1',
      fullName: 'Иванов',
    })
    expect(map.has(loftAssignmentKey(300, 5))).toBe(false)
  })

  it('halls: только назначения без loft', () => {
    const map = buildAssignmentOccupancy(managers, '2', 'halls')

    expect(map.get(hallOnlyAssignmentKey(200))).toEqual({
      managerId: '1',
      fullName: 'Иванов',
    })
    expect(map.has(hallOnlyAssignmentKey(100))).toBe(false)
    expect(map.has(loftAssignmentKey(100, 2))).toBe(false)
  })

  it('исключает редактируемого менеджера', () => {
    const map = buildAssignmentOccupancy(managers, '1', 'lofts')

    expect(map.get(loftAssignmentKey(300, 5))).toEqual({
      managerId: '2',
      fullName: 'Петров',
    })
    expect(map.has(loftAssignmentKey(100, 2))).toBe(false)
  })

  it('при дубликате ключа оставляет первого встреченного', () => {
    const duplicateManagers: Manager[] = [
      manager('1', 'Первый', [
        {
          id: 1,
          hallId: 1,
          hallName: 'Зал',
          loftId: 1,
          loftName: 'Loft',
          label: 'L',
        },
      ]),
      manager('2', 'Второй', [
        {
          id: 2,
          hallId: 1,
          hallName: 'Зал',
          loftId: 1,
          loftName: 'Loft',
          label: 'L',
        },
      ]),
    ]

    const map = buildAssignmentOccupancy(duplicateManagers, '3', 'lofts')
    expect(map.get(loftAssignmentKey(1, 1))?.fullName).toBe('Первый')
  })
})
