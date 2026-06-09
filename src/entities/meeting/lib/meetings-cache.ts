import type { QueryClient } from '@tanstack/react-query'

import type { MeetingCalendarResponse } from '@/shared/api/generated/types/MeetingCalendarResponse'

import type { ListMeetingsParams, Meeting } from '../model/types'
import { meetingToApiStub } from './from-meeting'
import { listMeetingsParamsToApi, meetingsCalendarQueryKey } from './meetings-calendar-query'

function updateCalendarCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  updater: (results: MeetingCalendarResponse['results']) => MeetingCalendarResponse['results'],
) {
  const key = meetingsCalendarQueryKey(listMeetingsParamsToApi(params))
  queryClient.setQueryData<MeetingCalendarResponse>(key, (prev) => {
    if (!prev) return prev
    const results = updater(prev.results)
    return { ...prev, results, count: results.length }
  })
}

export function prependMeetingToCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  meeting: Meeting,
) {
  const stub = meetingToApiStub(meeting)
  updateCalendarCache(queryClient, params, (results) => [...results, stub])
}

export function replaceMeetingInCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  meeting: Meeting,
) {
  const stub = meetingToApiStub(meeting)
  updateCalendarCache(queryClient, params, (results) =>
    results.map((m) => (m.id === meeting.id ? stub : m)),
  )
}

export function removeMeetingFromCache(
  queryClient: QueryClient,
  params: ListMeetingsParams,
  meetingId: number,
) {
  updateCalendarCache(queryClient, params, (results) => results.filter((m) => m.id !== meetingId))
}
