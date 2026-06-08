import type { QueryClient } from '@tanstack/react-query'

import type { ListMeetingsParams, Meeting } from '../model/types'
import { meetingsCalendarQueryKey } from './meetings-query-key'

export function prependMeetingToCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  meeting: Meeting,
) {
  const key = meetingsCalendarQueryKey(params)
  queryClient.setQueryData<Meeting[]>(key, (prev) => (prev ? [...prev, meeting] : [meeting]))
}

export function replaceMeetingInCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  meeting: Meeting,
) {
  const key = meetingsCalendarQueryKey(params)
  queryClient.setQueryData<Meeting[]>(key, (prev) =>
    prev ? prev.map((m) => (m.id === meeting.id ? meeting : m)) : [meeting],
  )
}

export function removeMeetingFromCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  meetingId: string,
) {
  const key = meetingsCalendarQueryKey(params)
  queryClient.setQueryData<Meeting[]>(key, (prev) =>
    prev ? prev.filter((m) => m.id !== meetingId) : [],
  )
}
