import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'

import { ACCESS_TOKEN_KEY } from '@/shared/lib/auth-session'

import { axiosInstance, refreshAccessToken, resetAuthRefreshStateForTests } from './client'

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

function axiosResponse(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function axios401(config: InternalAxiosRequestConfig) {
  return Promise.reject({
    config,
    response: {
      status: 401,
      data: {},
      headers: {},
      statusText: 'Unauthorized',
      config,
    },
    isAxiosError: true,
  })
}

describe('client auth refresh', () => {
  const storage = createStorage()
  let assignMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubGlobal('localStorage', storage)
    storage.clear()
    resetAuthRefreshStateForTests()
    assignMock = vi.fn()
    vi.stubGlobal('window', {
      location: { pathname: '/projects', assign: assignMock },
    })
    delete axiosInstance.defaults.adapter
  })

  it('refreshAccessToken сохраняет новый access из ответа', async () => {
    axiosInstance.defaults.adapter = vi.fn(async (config) =>
      axiosResponse(config, { access: 'from-refresh' }),
    ) as AxiosAdapter

    await expect(refreshAccessToken()).resolves.toBe('from-refresh')
    expect(storage.getItem(ACCESS_TOKEN_KEY)).toBe('from-refresh')
  })

  it('при 401 из-за просроченного access обновляет токен и повторяет запрос', async () => {
    storage.setItem(ACCESS_TOKEN_KEY, 'expired-access')

    let usersMeCalls = 0
    axiosInstance.defaults.adapter = vi.fn(async (config) => {
      const url = config.url ?? ''
      if (url.includes('/auth/token/refresh/')) {
        expect(config.headers?.Authorization).toBeUndefined()
        return axiosResponse(config, { access: 'fresh-access' })
      }
      if (url.includes('/users/me')) {
        usersMeCalls += 1
        if (usersMeCalls === 1) return axios401(config)
        expect(config.headers?.Authorization).toBe('Bearer fresh-access')
        return axiosResponse(config, { id: 1 })
      }
      throw new Error(`Unexpected url: ${url}`)
    }) as AxiosAdapter

    const { data } = await axiosInstance.get('/api/v1/users/me/')
    expect(data).toEqual({ id: 1 })
    expect(storage.getItem(ACCESS_TOKEN_KEY)).toBe('fresh-access')
    expect(usersMeCalls).toBe(2)
  })

  it('при провале refresh чистит сессию и редиректит на /login', async () => {
    storage.setItem(ACCESS_TOKEN_KEY, 'expired-access')

    axiosInstance.defaults.adapter = vi.fn(async (config) => {
      const url = config.url ?? ''
      if (url.includes('/auth/token/refresh/')) return axios401(config)
      if (url.includes('/users/me')) return axios401(config)
      throw new Error(`Unexpected url: ${url}`)
    }) as AxiosAdapter

    await expect(axiosInstance.get('/api/v1/users/me/')).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(storage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(assignMock).toHaveBeenCalledWith('/login')
  })
})
