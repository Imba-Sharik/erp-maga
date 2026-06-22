import { getTransitionErrorMessage } from '@/shared/api'

/** Достаёт `detail` из ответа бэка (например, требование привязать Telegram), иначе — fallback. */
export function getReminderErrorMessage(error: unknown, fallback: string): string {
  return getTransitionErrorMessage(error, fallback)
}
