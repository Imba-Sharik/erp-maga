import { useCallback, useMemo } from 'react'

import { DEFAULT_CITY_OPTIONS } from '../lib/default-city-options'
import { deriveCityOptionsFromLofts } from '../lib/derive-city-options'
import { hallBelongsToLoft, hallsForLoft } from '../lib/halls-by-loft'
import { scopeVenueCatalogByHallIds } from '../lib/scope-venue-catalog-by-hall-ids'
import { hallsToSelectOptions, loftsToSelectOptions } from '../lib/to-select-options'
import type { VenueSelectOption } from './types'
import { useVenueCatalog } from './use-venue-catalog'

export interface UseLoftHallFilterOptions {
  /** Для менеджера MAG — только закреплённые залы/лофты; скрывает лишние фильтры. */
  assigned?: boolean
  /** Сузить каталог до указанных id залов (lead/admin при выборе менеджера). undefined — без ограничения. */
  restrictToHallIds?: readonly number[] | undefined
}

export interface LoftHallFilter {
  loftOptions: VenueSelectOption[]
  /** Опции залов с учётом выбранного лофта: выбран лофт — только его залы, иначе все. */
  hallOptions: VenueSelectOption[]
  /** Опции городов: `value` — Plum ID, `label` — название. */
  cityOptions: readonly VenueSelectOption[]
  showCityFilter: boolean
  showLoftFilter: boolean
  selectDisabled: boolean
  /** true — выбранный зал не принадлежит новому лофту и его надо сбросить. */
  shouldResetHall: (nextLoft: string | null, currentHall: string | null) => boolean
}

/**
 * Зависимые фильтры «зал ↔ лофт»: при выбранном лофте в списке залов остаются
 * только его залы; при смене лофта подсказывает, нужно ли сбросить выбранный зал.
 * Общая логика для тулбаров (проекты, закрытие, календарь, менеджеры) и таблиц.
 */
export function useLoftHallFilter(
  loft: string | null,
  options?: UseLoftHallFilterOptions,
): LoftHallFilter {
  const assigned = options?.assigned ?? false
  const restrictToHallIds = options?.restrictToHallIds
  const {
    halls: catalogHalls,
    lofts: catalogLofts,
    isLoading,
    isError,
  } = useVenueCatalog(assigned ? { assigned: true } : undefined)

  const { halls, lofts } = useMemo(
    () => scopeVenueCatalogByHallIds(catalogHalls, catalogLofts, restrictToHallIds),
    [catalogHalls, catalogLofts, restrictToHallIds],
  )

  const hallOptions = useMemo(() => hallsToSelectOptions(halls), [halls])
  const loftOptions = useMemo(() => loftsToSelectOptions(lofts), [lofts])

  const filteredHallOptions = useMemo(() => {
    if (!loft) return hallOptions
    return hallsToSelectOptions(hallsForLoft(halls, lofts, loft))
  }, [loft, halls, lofts, hallOptions])

  const cityOptions = useMemo(
    () => (assigned ? deriveCityOptionsFromLofts(lofts) : DEFAULT_CITY_OPTIONS),
    [assigned, lofts],
  )

  const shouldResetHall = useCallback(
    (nextLoft: string | null, currentHall: string | null) =>
      Boolean(nextLoft && currentHall && !hallBelongsToLoft(halls, lofts, currentHall, nextLoft)),
    [halls, lofts],
  )

  return {
    loftOptions,
    hallOptions: filteredHallOptions,
    cityOptions,
    showCityFilter: !assigned || cityOptions.length > 1,
    showLoftFilter: !assigned || lofts.length > 1,
    selectDisabled: isLoading || isError,
    shouldResetHall,
  }
}
