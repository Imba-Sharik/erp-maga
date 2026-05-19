import { ACCESS_TOKEN_KEY } from '@/entities/session'
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (!token) return config

  config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData> & {
  baseURL?: string
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

export default client
