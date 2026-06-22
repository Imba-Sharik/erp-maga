export const ACCESS_TOKEN_KEY = 'access_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/** Сохраняет access-токен после логина или refresh. */
export function setAccessToken(access: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
}

/** Очищает сессию (logout). */
export function clearSessionTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
