import type { QueryClient } from '@tanstack/react-query'

import type { ReminderCalendarResponse } from '@/shared/api/generated/types/ReminderCalendarResponse'

import type { ListRemindersParams, Reminder } from '../model/types'
import { reminderToApiStub } from './from-reminder'
import { listRemindersParamsToApi, remindersCalendarQueryKey } from './reminders-calendar-query'

function updateCalendarCache(
  queryClient: QueryClient,
  params: ListRemindersParams,
  updater: (results: ReminderCalendarResponse['results']) => ReminderCalendarResponse['results'],
) {
  const key = remindersCalendarQueryKey(listRemindersParamsToApi(params))
  queryClient.setQueryData<ReminderCalendarResponse>(key, (prev) => {
    if (!prev) return prev
    const results = updater(prev.results)
    return { ...prev, results, count: results.length }
  })
}

export function prependReminderToCache(
  queryClient: QueryClient,
  params: ListRemindersParams,
  reminder: Reminder,
) {
  const stub = reminderToApiStub(reminder)
  updateCalendarCache(queryClient, params, (results) => [...results, stub])
}

export function replaceReminderInCache(
  queryClient: QueryClient,
  params: ListRemindersParams,
  reminder: Reminder,
) {
  const stub = reminderToApiStub(reminder)
  updateCalendarCache(queryClient, params, (results) =>
    results.map((r) => (r.id === reminder.id ? stub : r)),
  )
}

export function removeReminderFromCache(
  queryClient: QueryClient,
  params: ListRemindersParams,
  reminderId: number,
) {
  updateCalendarCache(queryClient, params, (results) => results.filter((r) => r.id !== reminderId))
}
