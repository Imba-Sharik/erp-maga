import { describe, expect, it } from 'vitest'

import { shouldAttachAccessToken } from './should-attach-access-token'

describe('shouldAttachAccessToken', () => {
  it('false для login, refresh, verify, logout', () => {
    expect(shouldAttachAccessToken('/api/v1/auth/token/')).toBe(false)
    expect(shouldAttachAccessToken('/api/v1/auth/token/refresh/')).toBe(false)
    expect(shouldAttachAccessToken('/api/v1/auth/token/verify/')).toBe(false)
    expect(shouldAttachAccessToken('/api/v1/auth/logout/')).toBe(false)
  })

  it('true для обычных API-запросов', () => {
    expect(shouldAttachAccessToken('/api/v1/users/me/')).toBe(true)
    expect(shouldAttachAccessToken('/api/v1/halls/halls/')).toBe(true)
  })
})
