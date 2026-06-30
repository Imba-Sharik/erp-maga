// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { filtersStorageKey } from '@/shared/lib/filter-storage'
import { useFilterParams, type FilterPersistConfig } from './use-filter-params'

const KEY = filtersStorageKey('test')
const PARAMS = ['loft', 'hall', 'plum'] as const

/** Хук + текущий `location.search`, чтобы проверять и значения, и состояние URL. */
function useHarness(persist?: FilterPersistConfig) {
  const fp = useFilterParams(persist)
  const { search } = useLocation()
  return { fp, search }
}

function renderHarness(initialEntry: string, persist?: FilterPersistConfig) {
  return renderHook(() => useHarness(persist), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    ),
  })
}

const PERSIST: FilterPersistConfig = { scope: 'test', params: PARAMS }

function readStore(): Record<string, string> | null {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Record<string, string>) : null
}

describe('useFilterParams + персистентность', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('гидрирует «чистый» URL из localStorage', async () => {
    localStorage.setItem(KEY, JSON.stringify({ loft: '1', plum: '3,4' }))
    const { result } = renderHarness('/req', PERSIST)

    await waitFor(() => expect(result.current.fp.getString('loft')).toBe('1'))
    expect(result.current.fp.getArray('plum')).toEqual(['3', '4'])
    expect(result.current.search).toContain('loft=1')
  })

  it('URL побеждает: при наличии своих параметров гидрации нет', async () => {
    localStorage.setItem(KEY, JSON.stringify({ loft: '1' }))
    const { result } = renderHarness('/req?loft=2', PERSIST)

    // Дать эффекту шанс выполниться — значение из URL должно сохраниться.
    await waitFor(() => expect(result.current.fp.getString('loft')).toBe('2'))
    expect(result.current.fp.getString('loft')).toBe('2')
  })

  it('посторонний параметр не из набора не мешает гидрации', async () => {
    localStorage.setItem(KEY, JSON.stringify({ loft: '1' }))
    const { result } = renderHarness('/req?sort=name', PERSIST)

    await waitFor(() => expect(result.current.fp.getString('loft')).toBe('1'))
    expect(result.current.fp.getString('sort')).toBe('name')
  })

  it('изменение фильтра зеркалится в localStorage', async () => {
    const { result } = renderHarness('/req', PERSIST)

    act(() => result.current.fp.set('loft', '5'))
    await waitFor(() => expect(readStore()).toEqual({ loft: '5' }))
    expect(result.current.fp.getString('loft')).toBe('5')

    act(() => result.current.fp.set('plum', ['3', '4']))
    await waitFor(() => expect(readStore()).toEqual({ loft: '5', plum: '3,4' }))
  })

  it('сброс всех фильтров очищает сохранённое (removeItem)', async () => {
    localStorage.setItem(KEY, JSON.stringify({ loft: '1' }))
    const { result } = renderHarness('/req', PERSIST)
    await waitFor(() => expect(result.current.fp.getString('loft')).toBe('1'))

    act(() => result.current.fp.set('loft', null))
    await waitFor(() => expect(localStorage.getItem(KEY)).toBeNull())
    expect(result.current.fp.getString('loft')).toBeNull()
  })

  it('каскадный patch пишет финальный срез (сброшенные ключи удалены)', async () => {
    localStorage.setItem(KEY, JSON.stringify({ loft: '9', hall: 'a' }))
    const { result } = renderHarness('/req', PERSIST)
    await waitFor(() => expect(result.current.fp.getString('loft')).toBe('9'))

    // Условный «сменили менеджера»: ставим plum и одновременно сбрасываем loft/hall.
    act(() => result.current.fp.patch({ plum: ['7'], loft: null, hall: null }))
    await waitFor(() => expect(readStore()).toEqual({ plum: '7' }))
  })

  it('без persist-конфига localStorage не трогается', () => {
    const { result } = renderHarness('/req')

    act(() => result.current.fp.set('loft', '1'))
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(result.current.fp.getString('loft')).toBe('1')
  })
})
