import { getTransitionErrorMessage } from '@/shared/api/project-transition/get-transition-error-message'

/** Достаёт `detail` из ответа бэка (например, требование привязать Telegram), иначе — fallback. */
export function getReminderErrorMessage(error: unknown, fallback: string): string {
  return getTransitionErrorMessage(error, fallback)
}
