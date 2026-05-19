/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCKS: string
  readonly VITE_DEV_ACCESS_TOKEN_MANAGER: string
  readonly VITE_DEV_ACCESS_TOKEN_DIRECTOR: string
  readonly VITE_DEV_ACCESS_TOKEN_ACCOUNTANT: string
  readonly VITE_DEV_REFRESH_TOKEN_MANAGER: string
  readonly VITE_DEV_REFRESH_TOKEN_DIRECTOR: string
  readonly VITE_DEV_REFRESH_TOKEN_ACCOUNTANT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
