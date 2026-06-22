import { getTransitionErrorMessage } from '@/shared/api'

export function getTelegramLinkErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось выполнить операцию с Telegram')
}
