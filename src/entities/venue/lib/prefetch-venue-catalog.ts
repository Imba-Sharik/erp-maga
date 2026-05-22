import type { QueryClient } from '@tanstack/react-query'

import { hallsCatalogQueryOptions, loftsCatalogQueryOptions } from './venue-catalog-query'

export function prefetchVenueCatalog(queryClient: QueryClient): Promise<void> {
  return Promise.all([
    queryClient.prefetchQuery(hallsCatalogQueryOptions()),
    queryClient.prefetchQuery(loftsCatalogQueryOptions()),
  ]).then(() => undefined)
}
