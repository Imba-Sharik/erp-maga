import { describe, expect, it } from 'vitest'

import { shouldAttemptTokenRefresh } from './should-attempt-token-refresh'

describe('shouldAttemptTokenRefresh', () => {
  it('true для 401 на обычном API-запросе', () => {
    expect(shouldAttemptTokenRefresh(401, { url: '/api/v1/users/me/' })).toBe(true)
  })

  it('false если не 401', () => {
    expect(shouldAttemptTokenRefresh(403, { url: '/api/v1/users/me/' })).toBe(false)
  })

  it('false для auth-эндпоинтов', () => {
    expect(shouldAttemptTokenRefresh(401, { url: '/api/v1/auth/token/refresh/' })).toBe(false)
    expect(shouldAttemptTokenRefresh(401, { url: '/api/v1/auth/logout/' })).toBe(false)
  })

  it('false если запрос уже повторён или refresh пропущен', () => {
    expect(shouldAttemptTokenRefresh(401, { url: '/api/v1/users/me/', _retry: true })).toBe(false)
    expect(
      shouldAttemptTokenRefresh(401, { url: '/api/v1/users/me/', _skipAuthRefresh: true }),
    ).toBe(false)
  })
})
