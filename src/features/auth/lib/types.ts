/**
 * Ответ `POST /api/v1/auth/token/` (SimpleJWT). В OpenAPI операция возвращает `any`
 * — `TokenPairResponse` описан, но не реферится в `responses`. Локальный тип-страховка
 * для consume-сайта; убрать, когда бэк починит spec.
 */
export interface TokenPair {
  access: string
  refresh: string
}
