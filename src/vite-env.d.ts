/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_PROXY_TARGET: string
  readonly VITE_USE_MOCKS: string
  readonly VITE_DEV_EMAIL_MANAGER: string
  readonly VITE_DEV_PASSWORD_MANAGER: string
  readonly VITE_DEV_EMAIL_DIRECTOR: string
  readonly VITE_DEV_PASSWORD_DIRECTOR: string
  readonly VITE_DEV_EMAIL_ACCOUNTANT: string
  readonly VITE_DEV_PASSWORD_ACCOUNTANT: string
  readonly VITE_DEV_EMAIL_ADMIN: string
  readonly VITE_DEV_PASSWORD_ADMIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
