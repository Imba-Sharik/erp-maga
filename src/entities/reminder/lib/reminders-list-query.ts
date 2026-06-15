import {
  remindersListQueryKey,
  remindersListQueryOptions,
} from '@/shared/api/generated/hooks/remindersController/useRemindersList'

export { remindersListQueryKey }

const PROJECT_REMINDERS_LIMIT = 200

export function projectRemindersQueryOptions(projectId: number) {
  return remindersListQueryOptions({ project: projectId, limit: PROJECT_REMINDERS_LIMIT })
}
