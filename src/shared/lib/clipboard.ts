/**
 * Кроссбраузерное копирование текста в буфер обмена.
 *
 * Сначала пробуем современный async Clipboard API (доступен только в secure
 * context — https/localhost), при недоступности откатываемся на legacy-приём с
 * временным `<textarea>` и `execCommand('copy')`. Возвращает `true` ТОЛЬКО при
 * подтверждённом успехе — вызывающий код опирается на это, чтобы показать тост.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text)
      return true
    } catch {
      // Отказ в доступе или не secure context — пробуем legacy-путь ниже.
    }
  }
  return legacyCopy(text)
}

/**
 * Доступно ли копирование в текущем окружении. Нужно, чтобы не показывать
 * интерактивную аффорданс там, где скопировать всё равно нельзя.
 */
export function isClipboardCopySupported(): boolean {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
  if (clipboard && typeof clipboard.writeText === 'function') return true
  return (
    typeof document !== 'undefined' &&
    typeof document.queryCommandSupported === 'function' &&
    document.queryCommandSupported('copy')
  )
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  // Убираем из потока и с экрана, не теряя возможности выделить.
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)

  // Сохраняем текущее выделение пользователя, чтобы восстановить после копирования.
  const selection = document.getSelection()
  const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  textarea.select()

  let succeeded = false
  try {
    succeeded = document.execCommand('copy')
  } catch {
    succeeded = false
  }

  document.body.removeChild(textarea)
  if (savedRange && selection) {
    selection.removeAllRanges()
    selection.addRange(savedRange)
  }
  return succeeded
}
