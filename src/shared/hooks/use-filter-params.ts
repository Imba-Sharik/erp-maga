import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  buildHydratedParams,
  filtersStorageKey,
  pickStoredSnapshot,
  readStoredFilters,
  shouldHydrate,
  writeStoredFilters,
} from '@/shared/lib/filter-storage'

/**
 * Значение фильтра для записи в URL:
 * - строка — `?key=value`
 * - массив строк — `?key=a,b,c` (пустой массив удаляет параметр)
 * - `null` / `''` — параметр удаляется (дефолтное/сброшенное состояние не засоряет URL)
 */
export type FilterParamValue = string | string[] | null

/**
 * Опциональная персистентность фильтров в localStorage (см. {@link useFilterParams}).
 * Без неё хук ведёт себя как раньше — состояние только в URL.
 */
export interface FilterPersistConfig {
  /** Идентификатор экрана; ключ localStorage строится внутри как `erp-maga:filters:<scope>`. */
  scope: string
  /**
   * Какие query-ключи персистить. ВАЖНО: ссылка должна быть стабильной
   * (модульная константа), иначе эффекты будут перезапускаться на каждый рендер.
   */
  params: readonly string[]
}

export interface FilterParams {
  /** Строковый фильтр; `null`, если параметра нет в URL (дефолт подставляйте через `??`). */
  getString: (key: string) => string | null
  /** Массивный фильтр (значения через запятую); отсутствие/пусто → `[]`. */
  getArray: (key: string) => string[]
  /** Атомарно записать набор изменений одним переходом (replace). */
  patch: (updates: Record<string, FilterParamValue>) => void
  /** Записать один параметр (частный случай `patch`). */
  set: (key: string, value: FilterParamValue) => void
}

/**
 * Состояние фильтров/поиска/сортировки в query-параметрах URL — переживает
 * перезагрузку страницы, шарится ссылкой и работает с кнопкой «назад».
 * Дефолтные и сброшенные значения из URL убираются (см. {@link FilterParamValue}).
 *
 * Обобщает паттерн из `useProjectTab` (`?tab=`): навигация через `replace`,
 * пустые значения удаляются.
 *
 * Зависимые фильтры (смена лофта сбрасывает зал; смена менеджера — лофт/зал)
 * могут делать несколько `set()` в одном обработчике: благодаря `draftRef`
 * каждый следующий `set` строится поверх результата предыдущего в том же тике.
 * Иначе react-router 7 замкнул бы функц. апдейтер на `searchParams` текущего
 * рендера, и параллельные `setSearchParams` затёрли бы друг друга.
 */
export function useFilterParams(persist?: FilterPersistConfig): FilterParams {
  const [params, setParams] = useSearchParams()
  // Снимаем стабильные примитивы, чтобы не зависеть от идентичности inline-объекта `persist`.
  // Полный ключ хранилища строим из `scope` здесь — потребители про префикс не знают.
  const persistParams = persist?.params
  const persistKey = persist ? filtersStorageKey(persist.scope) : undefined

  // Черновик последнего применённого набора параметров в пределах тика.
  // Синхронизируется с актуальным URL после коммита (в т.ч. при «назад/вперёд»);
  // обработчики событий выполняются уже после эффекта, поэтому видят свежее значение.
  const draftRef = useRef(params)
  useEffect(() => {
    draftRef.current = params
  }, [params])

  // Гидрация из localStorage — один раз на маунте и только если URL «чистый» по своим
  // ключам (URL приоритетен). Гидрированное состояние пишем в URL через `replace`, чтобы
  // остальной код читал его как обычно и история не засорялась. `hydratedRef` гарантирует
  // однократность; `params` в зависимостях — лишь чтобы линтер видел чтение (повторы — no-op).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    if (!persistKey || !persistParams) return
    if (!shouldHydrate(params, persistParams)) return
    const next = buildHydratedParams(params, readStoredFilters(persistKey), persistParams)
    if (next) {
      draftRef.current = next
      setParams(next, { replace: true })
    }
  }, [persistKey, persistParams, params, setParams])

  const patch = useCallback(
    (updates: Record<string, FilterParamValue>) => {
      const next = new URLSearchParams(draftRef.current)
      for (const [key, value] of Object.entries(updates)) {
        const encoded = Array.isArray(value) ? value.join(',') : value
        if (encoded == null || encoded === '') next.delete(key)
        else next.set(key, encoded)
      }
      draftRef.current = next
      setParams(next, { replace: true })
      // Зеркалим срез своих ключей в localStorage синхронно с изменением. Через `patch`
      // проходят и `set`, и каскадные обновления — поэтому отдельный эффект-зеркало не нужен
      // (и нет гонки с гидрацией: запись происходит только по действию пользователя).
      if (persistKey && persistParams) {
        writeStoredFilters(persistKey, pickStoredSnapshot(next, persistParams))
      }
    },
    [setParams, persistKey, persistParams],
  )

  const set = useCallback(
    (key: string, value: FilterParamValue) => patch({ [key]: value }),
    [patch],
  )

  const getString = useCallback((key: string) => params.get(key), [params])

  const getArray = useCallback(
    (key: string) => {
      const raw = params.get(key)
      return raw ? raw.split(',').filter(Boolean) : []
    },
    [params],
  )

  return { getString, getArray, patch, set }
}
