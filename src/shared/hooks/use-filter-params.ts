import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Значение фильтра для записи в URL:
 * - строка — `?key=value`
 * - массив строк — `?key=a,b,c` (пустой массив удаляет параметр)
 * - `null` / `''` — параметр удаляется (дефолтное/сброшенное состояние не засоряет URL)
 */
export type FilterParamValue = string | string[] | null

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
export function useFilterParams(): FilterParams {
  const [params, setParams] = useSearchParams()

  // Черновик последнего применённого набора параметров в пределах тика.
  // Синхронизируется с актуальным URL после коммита (в т.ч. при «назад/вперёд»);
  // обработчики событий выполняются уже после эффекта, поэтому видят свежее значение.
  const draftRef = useRef(params)
  useEffect(() => {
    draftRef.current = params
  }, [params])

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
    },
    [setParams],
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
