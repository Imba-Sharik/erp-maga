import { getTransitionErrorMessage } from '@/shared/api/project-transition/get-transition-error-message'

export function getTelegramLinkErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось выполнить операцию с Telegram')
}
