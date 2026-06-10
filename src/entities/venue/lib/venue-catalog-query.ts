import { hallsHallsListQueryOptions } from '@/shared/api/generated/hooks/hallsController/useHallsHallsList'
import { hallsLoftsListQueryOptions } from '@/shared/api/generated/hooks/hallsController/useHallsLoftsList'
import type { HallsHallsListQueryParams } from '@/shared/api/generated/types/hallsController/HallsHallsList'
import type { HallsLoftsListQueryParams } from '@/shared/api/generated/types/hallsController/HallsLoftsList'

/** Справочники залов/лофтов меняются редко — держим в кэше до перезагрузки вкладки. */
export const VENUE_CATALOG_STALE_TIME = Number.POSITIVE_INFINITY

const VENUE_CATALOG_GC_TIME = 24 * 60 * 60 * 1000

const catalogQueryOverrides = {
  staleTime: VENUE_CATALOG_STALE_TIME,
  gcTime: VENUE_CATALOG_GC_TIME,
} as const

export function hallsCatalogQueryOptions(params?: HallsHallsListQueryParams) {
  return {
    ...hallsHallsListQueryOptions(params),
    ...catalogQueryOverrides,
  }
}

export function loftsCatalogQueryOptions(params?: HallsLoftsListQueryParams) {
  return {
    ...hallsLoftsListQueryOptions(params),
    ...catalogQueryOverrides,
  }
}
