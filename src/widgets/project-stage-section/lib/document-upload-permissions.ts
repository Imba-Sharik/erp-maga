import type { DocumentStatus } from '@/entities/project'
import type { UserRole } from '@/entities/user-role'

/**
 * Можно ли роли загрузить/заменить файл закрывающего документа.
 *
 * Правила (приоритет бухгалтера над менеджером):
 * - поле недоступно для редактирования на этапе → заблокировано;
 * - статус `not_required` («Не требуется») → замена выключена у всех (скачивание остаётся);
 * - статус `present` («Есть») → менеджер менять не может (это подтвердил бухгалтер),
 *   а бухгалтер может перезалить;
 * - пустой статус или `re_requested` («Повторный запрос») → загрузка/замена доступна.
 *
 * Скачивание файла по клику не зависит от этой блокировки.
 */
export function isDocumentUploadLocked(
  role: UserRole,
  status: DocumentStatus | undefined,
  fieldEditable: boolean,
): boolean {
  if (!fieldEditable) return true
  if (status === 'not_required') return true
  if (status === 'present' && role === 'manager') return true
  return false
}
