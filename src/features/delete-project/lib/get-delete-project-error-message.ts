import { getTransitionErrorMessage } from '@/shared/api/project-transition/get-transition-error-message'

export function getDeleteProjectErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось удалить проект')
}
