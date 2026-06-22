import { getTransitionErrorMessage } from '@/shared/api'

export function getDeleteProjectErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось удалить проект')
}
