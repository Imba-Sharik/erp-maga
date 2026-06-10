import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { HallsHallsListQueryParams } from '@/shared/api/generated/types/hallsController/HallsHallsList'
import type { HallsLoftsListQueryParams } from '@/shared/api/generated/types/hallsController/HallsLoftsList'

import { hallsByLoftId, hallsToSelectOptions, loftsToSelectOptions } from '../lib/to-select-options'
import { hallsCatalogQueryOptions, loftsCatalogQueryOptions } from '../lib/venue-catalog-query'
import type { VenueHall, VenueLoft, VenueSelectOption } from './types'

let loggedVenueCatalogError = false

export interface UseVenueCatalogParams {
  /** Для менеджера MAG: вернуть только закреплённые за ним залы/лофты. */
  assigned?: boolean
}

export function useVenueCatalog(params?: UseVenueCatalogParams): {
  halls: VenueHall[]
  lofts: VenueLoft[]
  hallOptions: VenueSelectOption[]
  loftOptions: VenueSelectOption[]
  hallsByLoft: Map<number, VenueHall[]>
  isLoading: boolean
  isError: boolean
  error: Error | null
} {
  const hallsParams: HallsHallsListQueryParams | undefined = params?.assigned
    ? { assigned: true }
    : undefined
  const loftsParams: HallsLoftsListQueryParams | undefined = params?.assigned
    ? { assigned: true }
    : undefined

  const hallsQuery = useQuery(hallsCatalogQueryOptions(hallsParams))
  const loftsQuery = useQuery(loftsCatalogQueryOptions(loftsParams))

  const halls = hallsQuery.data ?? []
  const lofts = loftsQuery.data ?? []

  const hallOptions = useMemo(() => hallsToSelectOptions(halls), [halls])
  const loftOptions = useMemo(() => loftsToSelectOptions(lofts), [lofts])
  const hallsByLoft = useMemo(() => hallsByLoftId(halls), [halls])

  const isLoading = hallsQuery.isPending || loftsQuery.isPending
  const isError = hallsQuery.isError || loftsQuery.isError
  const error = (hallsQuery.error ?? loftsQuery.error ?? null) as Error | null

  useEffect(() => {
    if (!isError || loggedVenueCatalogError) return
    loggedVenueCatalogError = true
    if (import.meta.env.DEV) {
      console.error('[venue-catalog] failed to load halls or lofts', error)
    }
  }, [isError, error])

  return {
    halls,
    lofts,
    hallOptions,
    loftOptions,
    hallsByLoft,
    isLoading,
    isError,
    error,
  }
}
