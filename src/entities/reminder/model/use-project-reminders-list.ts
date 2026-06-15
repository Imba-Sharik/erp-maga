import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { extractRemindersList, fromReminder } from '../lib/from-reminder'
import { projectRemindersQueryOptions } from '../lib/reminders-list-query'
import { sortRemindersByTime } from '../lib/schedule'

/** Напоминания, привязанные к проекту (`GET /reminders/?project=`). */
export function useProjectRemindersList(projectId: number) {
  const query = useQuery(projectRemindersQueryOptions(projectId))

  const data = useMemo(() => {
    if (!query.data) return undefined
    const reminders = extractRemindersList(query.data).map(fromReminder)
    return sortRemindersByTime(reminders).sort((a, b) => a.date.localeCompare(b.date))
  }, [query.data])

  return { ...query, data }
}
