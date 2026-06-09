import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { mapBackendCalendarMeetings } from '../lib/from-meeting'
import { meetingsCalendarQueryOptions } from '../lib/meetings-calendar-query'
import type { ListMeetingsParams } from './types'

export function useMeetingsCalendarList(params: ListMeetingsParams) {
  const query = useQuery(meetingsCalendarQueryOptions(params))

  const data = useMemo(
    () => (query.data ? mapBackendCalendarMeetings(query.data.results) : undefined),
    [query.data],
  )

  return { ...query, data }
}
