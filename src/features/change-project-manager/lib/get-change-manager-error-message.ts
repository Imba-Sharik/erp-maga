import { getTransitionErrorMessage } from '@/shared/api/project-transition/get-transition-error-message'

export function getChangeManagerErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось сменить менеджера')
}
