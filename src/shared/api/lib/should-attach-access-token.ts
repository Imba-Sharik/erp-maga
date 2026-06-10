/** Не отправляем Bearer на auth-эндпоинты — там cookie или credentials в body. */
export function shouldAttachAccessToken(url?: string): boolean {
  if (!url) return true
  if (url.includes('/auth/token/')) return false
  if (url.includes('/auth/logout/')) return false
  return true
}
