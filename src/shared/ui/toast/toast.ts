import { toast as sonnerToast } from 'sonner'

/**
 * Единственная точка интеграции с sonner. Фичи импортируют `toast` отсюда и не
 * зависят от конкретной библиотеки напрямую — стиль и поведение меняются в одном месте.
 */
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  message: (message: string) => sonnerToast(message),
}
