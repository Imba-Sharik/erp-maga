import { getTransitionErrorMessage } from '@/shared/api'

export function getChangeManagerErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось сменить менеджера')
}
