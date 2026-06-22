import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ACCESS_TOKEN_KEY, clearSessionTokens, getAccessToken, setAccessToken } from './auth-session'

function createStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key]
    },
  }
}

describe('auth-session', () => {
  const storage = createStorage()

  beforeEach(() => {
    vi.stubGlobal('localStorage', storage)
    storage.clear()
  })

  it('setAccessToken / getAccessToken', () => {
    setAccessToken('jwt-access')
    expect(getAccessToken()).toBe('jwt-access')
    expect(storage.getItem(ACCESS_TOKEN_KEY)).toBe('jwt-access')
  })

  it('clearSessionTokens удаляет access', () => {
    setAccessToken('jwt-access')
    clearSessionTokens()
    expect(getAccessToken()).toBeNull()
  })
})
