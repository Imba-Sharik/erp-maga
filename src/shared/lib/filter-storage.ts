/**
 * Персистентность состояния фильтров/поиска/сортировок в localStorage.
 *
 * Чистые функции (без React) — здесь вся логика, которую покрываем юнит-тестами
 * в `node`-окружении. React-обвязка живёт в {@link useFilterParams} и остаётся тонкой.
 *
 * Схема — «Вариант A» (гибрид): URL приоритетен. localStorage только подменяет
 * «чистый» URL при заходе и зеркалит последнее состояние на каждое изменение.
 */

/** Срез фильтров: query-ключ → закодированное значение (массивы уже CSV, как в URL). */
export type StoredFilters = Record<string, string>

const FILTERS_KEY_PREFIX = 'erp-maga:filters:'

/** Ключ localStorage для экрана. Префикс `erp-maga:` — как у остальных ключей в проекте. */
export const filtersStorageKey = (scope: string): string => `${FILTERS_KEY_PREFIX}${scope}`

/** Плоский объект со строковыми значениями? Защита от повреждённого/чужого содержимого. */
function isStoredFilters(value: unknown): value is StoredFilters {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return Object.values(value).every((v) => typeof v === 'string')
}

/**
 * Прочитать сохранённый срез. Любая проблема (нет ключа, битый JSON, недоступный
 * localStorage в приватном режиме, неожиданная форма) деградирует до `{}`.
 */
export function readStoredFilters(key: string): StoredFilters {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return isStoredFilters(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Записать срез. Пустой срез (все фильтры сброшены) удаляет ключ — это и есть
 * «сброс очищает сохранённое». Недоступный localStorage не должен ронять сессию.
 */
export function writeStoredFilters(key: string, snapshot: StoredFilters): void {
  try {
    if (Object.keys(snapshot).length === 0) {
      localStorage.removeItem(key)
      return
    }
    localStorage.setItem(key, JSON.stringify(snapshot))
  } catch {
    // Персистентность тихо деградирует — фильтры продолжают работать в рамках сессии через URL.
  }
}

/** Срез из URL: только перечисленные ключи, пропускаем отсутствующие и пустые. */
export function pickStoredSnapshot(
  params: URLSearchParams,
  keys: readonly string[],
): StoredFilters {
  const snapshot: StoredFilters = {}
  for (const key of keys) {
    const value = params.get(key)
    if (value != null && value !== '') snapshot[key] = value
  }
  return snapshot
}

/**
 * Нужно ли гидрировать из localStorage. `true` ⇔ в URL нет ни одного «своего» ключа
 * (URL приоритетен). Посторонние параметры не из списка не мешают гидрации.
 */
export function shouldHydrate(params: URLSearchParams, keys: readonly string[]): boolean {
  return !keys.some((key) => {
    const value = params.get(key)
    return value != null && value !== ''
  })
}

/**
 * Наложить сохранённый срез на параметры. Возвращает НОВЫЙ `URLSearchParams`
 * (вход не мутируется) или `null`, если накладывать нечего. Ставит только ключи
 * из `keys` — лишние сохранённые ключи (дрейф схемы) игнорируются.
 */
export function buildHydratedParams(
  params: URLSearchParams,
  stored: StoredFilters,
  keys: readonly string[],
): URLSearchParams | null {
  const next = new URLSearchParams(params)
  let applied = false
  for (const key of keys) {
    const value = stored[key]
    if (value != null && value !== '') {
      next.set(key, value)
      applied = true
    }
  }
  return applied ? next : null
}
