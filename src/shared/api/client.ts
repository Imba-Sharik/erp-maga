import { clearSessionTokens, getAccessToken, setAccessToken } from '@/shared/lib/auth-session'
import { shouldAttachAccessToken } from '@/shared/api/internal/should-attach-access-token'
import { shouldAttemptTokenRefresh } from '@/shared/api/internal/should-attempt-token-refresh'
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Не пытаться refresh при 401 (auth-эндпоинты, повтор после refresh). */
    _skipAuthRefresh?: boolean
    /** Запрос уже повторён после refresh — не зацикливаться. */
    _retry?: boolean
  }
}

const REFRESH_URL = '/api/v1/auth/token/refresh/'

/**
 * DRF/django-filter ждёт multi-value фильтры через запятую (`?manager=1,2`),
 * а дефолтный axios сериализует массив как `manager[]=1&manager[]=2` — бэк такой
 * ключ не видит и фильтр игнорирует. Склеиваем массивы запятой; скаляры — как есть.
 */
export function serializeParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      if (value.length > 0) search.append(key, value.join(','))
    } else {
      search.append(key, String(value))
    }
  }
  return search.toString()
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
  paramsSerializer: { serialize: serializeParams },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (!token || !shouldAttachAccessToken(config.url)) return config

  config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function redirectToLogin(): void {
  if (window.location.pathname.startsWith('/login')) return
  window.location.assign('/login')
}

function processRefreshQueue(error: unknown | null, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error ?? new Error('Refresh failed'))
      return
    }
    resolve(token)
  })
  refreshQueue = []
}

/** Обновляет access по HttpOnly refresh cookie. Для silent bootstrap в RequireAuth. */
export async function refreshAccessToken(): Promise<string> {
  const { data } = await axiosInstance.post<{ access: string }>(
    REFRESH_URL,
    {},
    { _skipAuthRefresh: true },
  )
  setAccessToken(data.access)
  return data.access
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig | undefined
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }
    if (!shouldAttemptTokenRefresh(error.response?.status, originalRequest)) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers ??= {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            originalRequest._retry = true
            resolve(axiosInstance(originalRequest))
          },
          reject,
        })
      })
    }

    isRefreshing = true
    try {
      const access = await refreshAccessToken()
      processRefreshQueue(null, access)
      originalRequest.headers ??= {}
      originalRequest.headers.Authorization = `Bearer ${access}`
      originalRequest._retry = true
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processRefreshQueue(refreshError, null)
      clearSessionTokens()
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export type RequestConfig<TData = unknown> = Omit<AxiosRequestConfig<TData>, 'data'> & {
  baseURL?: string
  /** Kubb multipart-клиенты передают FormData, собранный из TData через buildFormData. */
  data?: TData | FormData
}

export type ResponseConfig<TData = unknown> = AxiosResponse<TData>

export type ResponseErrorConfig<TError = unknown> = {
  error: TError
  status: number
}

export const client = async <TData, _TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
  return axiosInstance.request<TData, ResponseConfig<TData>>(config)
}

export type Client = typeof client

/** Сброс mutex refresh — только для тестов. */
export function resetAuthRefreshStateForTests(): void {
  isRefreshing = false
  refreshQueue = []
}

export default client
