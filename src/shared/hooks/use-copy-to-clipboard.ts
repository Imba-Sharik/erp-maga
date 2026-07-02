import { useCallback, useState } from 'react'
import { copyTextToClipboard, isClipboardCopySupported } from '@/shared/lib/clipboard'

export interface UseCopyToClipboard {
  /** Доступно ли копирование в текущем окружении (для условной аффорданс). */
  isSupported: boolean
  /** Копирует текст; резолвится в `true` только при подтверждённом успехе. */
  copy: (text: string) => Promise<boolean>
}

export function useCopyToClipboard(): UseCopyToClipboard {
  // Возможности окружения в рамках сессии не меняются — вычисляем один раз.
  const [isSupported] = useState(isClipboardCopySupported)
  const copy = useCallback((text: string) => copyTextToClipboard(text), [])
  return { isSupported, copy }
}
