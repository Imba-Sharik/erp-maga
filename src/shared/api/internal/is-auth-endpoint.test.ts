import { describe, expect, it } from 'vitest'

import { isAuthEndpoint } from './is-auth-endpoint'

describe('isAuthEndpoint', () => {
  it('true для token и logout', () => {
    expect(isAuthEndpoint('/api/v1/auth/token/')).toBe(true)
    expect(isAuthEndpoint('/api/v1/auth/token/refresh/')).toBe(true)
    expect(isAuthEndpoint('/api/v1/auth/logout/')).toBe(true)
  })

  it('false для остальных путей', () => {
    expect(isAuthEndpoint('/api/v1/users/me/')).toBe(false)
    expect(isAuthEndpoint(undefined)).toBe(false)
  })
})
