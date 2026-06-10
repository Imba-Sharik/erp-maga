import { describe, expect, it } from 'vitest'

import {
  applyLoftSelection,
  deriveCityIdsFromHallIds,
  deriveSelectedLoftIds,
  getHallIdsForLoft,
  syncLoftHallSelection,
} from './loft-hall-selection'
import type { VenueHall } from '../model/types'

function hall(id: number, loftId: number | null, name = `Hall ${id}`): VenueHall {
  return {
    id,
    plum_id: id,
    name,
    loft: loftId == null ? null : { id: loftId, plum_id: loftId, name: `Loft ${loftId}` },
    synced_at: '2024-01-01T00:00:00Z',
  } as VenueHall
}

// Loft 1: halls 10, 11 | Loft 2: hall 20 | без лофта: hall 30
const halls: VenueHall[] = [hall(10, 1), hall(11, 1), hall(20, 2), hall(30, null)]

describe('getHallIdsForLoft', () => {
  it('возвращает все залы лофта', () => {
    expect(getHallIdsForLoft(halls, 1).sort()).toEqual([10, 11])
    expect(getHallIdsForLoft(halls, 2)).toEqual([20])
  })

  it('пустой массив для неизвестного лофта', () => {
    expect(getHallIdsForLoft(halls, 999)).toEqual([])
  })
})

describe('deriveSelectedLoftIds', () => {
  it('лофт выбран, если выбран хотя бы один его зал', () => {
    expect(deriveSelectedLoftIds(halls, [10]).sort()).toEqual([1])
  })

  it('частичный выбор зала лофта всё равно помечает лофт выбранным', () => {
    expect(deriveSelectedLoftIds(halls, [10, 20]).sort()).toEqual([1, 2])
  })

  it('пустой выбор → нет лофтов', () => {
    expect(deriveSelectedLoftIds(halls, [])).toEqual([])
  })

  it('зал без лофта не даёт лофта', () => {
    expect(deriveSelectedLoftIds(halls, [30])).toEqual([])
  })
})

describe('applyLoftSelection', () => {
  it('выбор лофта добавляет все его залы', () => {
    expect(applyLoftSelection(halls, [], [1]).sort()).toEqual([10, 11])
  })

  it('снятие лофта убирает все его залы', () => {
    expect(applyLoftSelection(halls, [10, 11, 20], [2]).sort()).toEqual([20])
  })

  it('сохраняет залы без лофта при изменениях лофтов', () => {
    expect(applyLoftSelection(halls, [30], [1]).sort()).toEqual([10, 11, 30])
  })

  it('повторный выбор уже отмеченного лофта ничего не меняет (идемпотентно)', () => {
    // hall 10 выбран → лофт 1 уже считается отмеченным; toggle не приходит как [1]
    expect(applyLoftSelection(halls, [10], [1]).sort()).toEqual([10])
  })

  it('добить лофт целиком можно снятием и повторным выбором', () => {
    // частично выбран (hall 10) → снимаем лофт → выбираем снова: добиваются все залы
    const cleared = applyLoftSelection(halls, [10], [])
    expect(cleared).toEqual([])
    expect(applyLoftSelection(halls, cleared, [1]).sort()).toEqual([10, 11])
  })

  it('идемпотентно при неизменном наборе лофтов', () => {
    expect(applyLoftSelection(halls, [10, 11], [1]).sort()).toEqual([10, 11])
  })
})

describe('syncLoftHallSelection', () => {
  it('нормализует залы и выводит производные лофты', () => {
    expect(syncLoftHallSelection(halls, [10, 10, 20])).toEqual({
      hallIds: [10, 20],
      loftIds: [1, 2],
    })
  })

  it('исключение всех залов лофта убирает лофт из производных', () => {
    expect(syncLoftHallSelection(halls, [20])).toEqual({
      hallIds: [20],
      loftIds: [2],
    })
  })

  it('сценарий «выбрали лофт → сняли один зал»: лофт остаётся', () => {
    const afterLoft = applyLoftSelection(halls, [], [1])
    const afterExclude = syncLoftHallSelection(
      halls,
      afterLoft.filter((id) => id !== 11),
    )
    expect(afterExclude).toEqual({ hallIds: [10], loftIds: [1] })
  })

  it('сценарий «сняли все залы лофта»: лофты пустые', () => {
    expect(syncLoftHallSelection(halls, [])).toEqual({ hallIds: [], loftIds: [] })
  })
})

describe('deriveCityIdsFromHallIds', () => {
  function hallWithCity(id: number, loftId: number | null, cityId: number | null): VenueHall {
    return {
      id,
      plum_id: id,
      name: `Hall ${id}`,
      loft:
        loftId == null
          ? null
          : { id: loftId, plum_id: loftId, name: `Loft ${loftId}`, city: cityId },
      synced_at: '2024-01-01T00:00:00Z',
    } as VenueHall
  }

  // Loft 1 → город 1 (залы 10, 11) | Loft 2 → город 2 (зал 20) | зал 30 без лофта
  const cityHalls: VenueHall[] = [
    hallWithCity(10, 1, 1),
    hallWithCity(11, 1, 1),
    hallWithCity(20, 2, 2),
    hallWithCity(30, null, null),
  ]

  it('возвращает уникальные id городов по выбранным залам', () => {
    expect(deriveCityIdsFromHallIds(cityHalls, [10, 11, 20])).toEqual([1, 2])
  })

  it('дедуплицирует город при нескольких залах одного лофта', () => {
    expect(deriveCityIdsFromHallIds(cityHalls, [10, 11])).toEqual([1])
  })

  it('игнорирует залы без лофта или без города', () => {
    expect(deriveCityIdsFromHallIds(cityHalls, [30])).toEqual([])
  })

  it('пустой выбор → пустой массив', () => {
    expect(deriveCityIdsFromHallIds(cityHalls, [])).toEqual([])
  })
})
