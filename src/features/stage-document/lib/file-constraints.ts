/** Ограничения на прикрепляемые файлы (закрывающие документы, смета и т.п.). */

export const FILE_ACCEPT =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

const BLOCKED_MIME_PREFIXES = ['video/', 'audio/'] as const
const BLOCKED_MIME_TYPES = new Set(['image/gif'])

export function isAllowedFile(file: File): boolean {
  const mime = file.type.toLowerCase()
  if (BLOCKED_MIME_TYPES.has(mime)) return false
  if (BLOCKED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) return false
  if (file.name.toLowerCase().endsWith('.gif')) return false
  return true
}

/** Проверка файла перед загрузкой; возвращает текст ошибки или null, если всё ок. */
export function validateAttachment(file: File): string | null {
  if (!isAllowedFile(file)) {
    return 'Недопустимый формат. Загрузите фото или документ (без GIF, видео и аудио).'
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Файл слишком большой. Максимальный размер — 20 МБ.'
  }
  return null
}
