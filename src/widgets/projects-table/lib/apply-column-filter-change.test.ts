import { describe, expect, it } from 'vitest'

import { EMPTY_COLUMN_FILTERS } from './filter-projects-table'
import { applyColumnFilterChange } from './apply-column-filter-change'

describe('applyColumnFilterChange', () => {
  it('смена менеджера сбрасывает hall и loft', () => {
    const prev = {
      ...EMPTY_COLUMN_FILTERS,
      manager: '5',
      hall: 'Зал 1',
      loft: 'Loft A',
    }

    expect(applyColumnFilterChange(prev, 'manager', '7')).toEqual({
      ...prev,
      manager: '7',
      hall: null,
      loft: null,
    })
  })

  it('снятие менеджера тоже сбрасывает hall и loft', () => {
    const prev = {
      ...EMPTY_COLUMN_FILTERS,
      manager: '5',
      hall: 'Зал 1',
      loft: 'Loft A',
    }

    expect(applyColumnFilterChange(prev, 'manager', null)).toEqual({
      ...prev,
      manager: null,
      hall: null,
      loft: null,
    })
  })

  it('другие фильтры не трогает hall и loft', () => {
    const prev = {
      ...EMPTY_COLUMN_FILTERS,
      hall: 'Зал 1',
      loft: 'Loft A',
    }

    expect(applyColumnFilterChange(prev, 'hall', 'Зал 2')).toEqual({
      ...prev,
      hall: 'Зал 2',
    })
  })
})
