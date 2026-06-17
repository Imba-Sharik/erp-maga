import { getTransitionErrorMessage } from '@/shared/api/project-transition/get-transition-error-message'

/**
 * Текст ошибки claim. Бэк отдаёт `detail` для 400 (проект уже взят / нет привязки
 * к залу) и 403 (попытка назначить чужой id) — его и показываем; иначе дефолт.
 */
export function getClaimErrorMessage(error: unknown): string {
  return getTransitionErrorMessage(error, 'Не удалось взять проект')
}
