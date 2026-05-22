import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { prefetchVenueCatalog } from '@/entities/venue'

export function VenueCatalogBootstrap() {
  const queryClient = useQueryClient()

  useEffect(() => {
    void prefetchVenueCatalog(queryClient)
  }, [queryClient])

  return null
}
