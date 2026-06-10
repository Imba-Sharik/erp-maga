/** Auth-эндпоинты: на их 401 refresh не запускаем (избежать цикла). */
export function isAuthEndpoint(url?: string): boolean {
  if (!url) return false
  return url.includes('/auth/token/') || url.includes('/auth/logout/')
}
