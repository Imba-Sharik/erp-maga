import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildHydratedParams,
  filtersStorageKey,
  pickStoredSnapshot,
  readStoredFilters,
  shouldHydrate,
  writeStoredFilters,
} from './filter-storage'

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

const KEY = 'erp-maga:filters:test'

describe('filtersStorageKey', () => {
  it('добавляет общий префикс', () => {
    expect(filtersStorageKey('requests:open')).toBe('erp-maga:filters:requests:open')
  })
})

describe('readStoredFilters', () => {
  const storage = createStorage()
  beforeEach(() => {
    vi.stubGlobal('localStorage', storage)
    storage.clear()
  })

  it('нет ключа → {}', () => {
    expect(readStoredFilters(KEY)).toEqual({})
  })

  it('валидный объект → round-trip', () => {
    storage.setItem(KEY, JSON.stringify({ loft: '1', hall: 'a,b' }))
    expect(readStoredFilters(KEY)).toEqual({ loft: '1', hall: 'a,b' })
  })

  it('битый JSON → {}', () => {
    storage.setItem(KEY, '{not json')
    expect(readStoredFilters(KEY)).toEqual({})
  })

  it('JSON не той формы (null / массив / нестроковые значения) → {}', () => {
    storage.setItem(KEY, 'null')
    expect(readStoredFilters(KEY)).toEqual({})
    storage.setItem(KEY, '[]')
    expect(readStoredFilters(KEY)).toEqual({})
    storage.setItem(KEY, JSON.stringify({ a: { nested: true } }))
    expect(readStoredFilters(KEY)).toEqual({})
    storage.setItem(KEY, JSON.stringify({ a: 1 }))
    expect(readStoredFilters(KEY)).toEqual({})
  })

  it('getItem бросает → {}', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied')
      },
    })
    expect(readStoredFilters(KEY)).toEqual({})
  })
})

describe('writeStoredFilters', () => {
  const storage = createStorage()
  beforeEach(() => {
    vi.stubGlobal('localStorage', storage)
    storage.clear()
  })

  it('непустой срез → setItem (round-trip)', () => {
    writeStoredFilters(KEY, { loft: '1', plum: '3,4' })
    expect(JSON.parse(storage.getItem(KEY)!)).toEqual({ loft: '1', plum: '3,4' })
  })

  it('пустой срез → removeItem (сброс очищает сохранённое)', () => {
    storage.setItem(KEY, JSON.stringify({ loft: '1' }))
    writeStoredFilters(KEY, {})
    expect(storage.getItem(KEY)).toBeNull()
  })

  it('setItem бросает → не падает', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {},
    })
    expect(() => writeStoredFilters(KEY, { loft: '1' })).not.toThrow()
  })
})

describe('pickStoredSnapshot', () => {
  it('берёт только перечисленные ключи; пропускает отсутствующие и пустые', () => {
    const params = new URLSearchParams('q=&loft=1&hall=a,b&other=x')
    expect(pickStoredSnapshot(params, ['q', 'loft', 'hall', 'stage'])).toEqual({
      loft: '1',
      hall: 'a,b',
    })
  })

  it('CSV-значения берутся вербатим', () => {
    const params = new URLSearchParams('plum=3,4,5')
    expect(pickStoredSnapshot(params, ['plum'])).toEqual({ plum: '3,4,5' })
  })

  it('игнорирует ключи вне списка', () => {
    const params = new URLSearchParams('manager=12')
    expect(pickStoredSnapshot(params, ['loft'])).toEqual({})
  })
})

describe('shouldHydrate', () => {
  it('нет ни одного «своего» ключа → true', () => {
    expect(shouldHydrate(new URLSearchParams(''), ['loft', 'hall'])).toBe(true)
  })

  it('есть хотя бы один ключ → false', () => {
    expect(shouldHydrate(new URLSearchParams('hall=a'), ['loft', 'hall'])).toBe(false)
  })

  it('CSV-значение считается присутствующим', () => {
    expect(shouldHydrate(new URLSearchParams('plum=3,4'), ['plum'])).toBe(false)
  })

  it('пустое значение ключа не считается присутствующим', () => {
    expect(shouldHydrate(new URLSearchParams('loft='), ['loft'])).toBe(true)
  })

  it('посторонний параметр не из списка не мешает гидрации', () => {
    expect(shouldHydrate(new URLSearchParams('sort=name'), ['loft', 'hall'])).toBe(true)
  })
})

describe('buildHydratedParams', () => {
  it('накладывает сохранённые ключи на «чистый» URL', () => {
    const next = buildHydratedParams(new URLSearchParams(''), { loft: '1', hall: 'a,b' }, [
      'loft',
      'hall',
    ])
    expect(next?.get('loft')).toBe('1')
    expect(next?.get('hall')).toBe('a,b')
  })

  it('ничего применимого → null', () => {
    expect(buildHydratedParams(new URLSearchParams(''), {}, ['loft'])).toBeNull()
    expect(buildHydratedParams(new URLSearchParams(''), { other: 'x' }, ['loft'])).toBeNull()
  })

  it('не мутирует вход', () => {
    const input = new URLSearchParams('')
    buildHydratedParams(input, { loft: '1' }, ['loft'])
    expect(input.get('loft')).toBeNull()
  })

  it('ставит только ключи из списка (дрейф схемы игнорируется)', () => {
    const next = buildHydratedParams(new URLSearchParams(''), { loft: '1', dropped: 'x' }, ['loft'])
    expect(next?.get('loft')).toBe('1')
    expect(next?.get('dropped')).toBeNull()
  })

  it('сохраняет посторонние существующие параметры', () => {
    const next = buildHydratedParams(new URLSearchParams('sort=name'), { loft: '1' }, ['loft'])
    expect(next?.get('sort')).toBe('name')
    expect(next?.get('loft')).toBe('1')
  })
})
