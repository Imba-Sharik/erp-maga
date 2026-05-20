import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../model/keys'

export interface SessionTokens {
  access: string
  refresh: string
}

/** Сохраняет JWT-пару в localStorage после успешного логина. */
export function setSessionTokens({ access, refresh }: SessionTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

/** Очищает сессию (logout). */
export function clearSessionTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
