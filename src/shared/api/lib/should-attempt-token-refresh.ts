import { isAuthEndpoint } from './is-auth-endpoint'

export interface AuthRefreshRequestMeta {
  _skipAuthRefresh?: boolean
  _retry?: boolean
  url?: string
}

/** Нужно ли при 401 вызвать POST /auth/token/refresh/ и повторить запрос. */
export function shouldAttemptTokenRefresh(
  status: number | undefined,
  config: AuthRefreshRequestMeta | undefined,
): boolean {
  if (!config || status !== 401) return false
  if (config._skipAuthRefresh || config._retry) return false
  if (isAuthEndpoint(config.url)) return false
  return true
}
