import { useCallback, useMemo } from 'react'

import { hallBelongsToLoft, hallsForLoft } from '../lib/halls-by-loft'
import { hallsToSelectOptions } from '../lib/to-select-options'
import type { VenueSelectOption } from './types'
import { useVenueCatalog } from './use-venue-catalog'

export interface LoftHallFilter {
  loftOptions: VenueSelectOption[]
  /** Опции залов с учётом выбранного лофта: выбран лофт — только его залы, иначе все. */
  hallOptions: VenueSelectOption[]
  selectDisabled: boolean
  /** true — выбранный зал не принадлежит новому лофту и его надо сбросить. */
  shouldResetHall: (nextLoft: string | null, currentHall: string | null) => boolean
}

/**
 * Зависимые фильтры «зал ↔ лофт»: при выбранном лофте в списке залов остаются
 * только его залы; при смене лофта подсказывает, нужно ли сбросить выбранный зал.
 * Общая логика для тулбаров (проекты, закрытие, календарь, менеджеры) и таблиц.
 */
export function useLoftHallFilter(loft: string | null): LoftHallFilter {
  const { halls, lofts, hallOptions, loftOptions, isLoading, isError } = useVenueCatalog()

  const filteredHallOptions = useMemo(() => {
    if (!loft) return hallOptions
    return hallsToSelectOptions(hallsForLoft(halls, lofts, loft))
  }, [loft, halls, lofts, hallOptions])

  const shouldResetHall = useCallback(
    (nextLoft: string | null, currentHall: string | null) =>
      Boolean(nextLoft && currentHall && !hallBelongsToLoft(halls, lofts, currentHall, nextLoft)),
    [halls, lofts],
  )

  return {
    loftOptions,
    hallOptions: filteredHallOptions,
    selectDisabled: isLoading || isError,
    shouldResetHall,
  }
}
