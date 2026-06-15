import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { mapBackendCalendarReminders } from '../lib/from-reminder'
import { remindersCalendarQueryOptions } from '../lib/reminders-calendar-query'
import type { ListRemindersParams } from './types'

export function useRemindersCalendarList(params: ListRemindersParams) {
  const query = useQuery(remindersCalendarQueryOptions(params))

  const data = useMemo(
    () => (query.data ? mapBackendCalendarReminders(query.data.results) : undefined),
    [query.data],
  )

  return { ...query, data }
}
