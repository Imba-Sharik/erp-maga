import { describe, expect, it } from 'vitest'

import { serializeParams } from './client'

describe('serializeParams', () => {
  it('склеивает массив через запятую (DRF multi-value)', () => {
    const qs = serializeParams({ manager: [1, 2] })
    expect(decodeURIComponent(qs)).toBe('manager=1,2')
  })

  it('одиночный элемент массива — тоже через запятую (без скобок)', () => {
    expect(serializeParams({ manager: [5] })).toBe('manager=5')
  })

  it('пропускает пустой массив и null/undefined', () => {
    expect(serializeParams({ manager: [], hall: null, loft: undefined })).toBe('')
  })

  it('скаляры сериализует как есть', () => {
    const qs = serializeParams({ date_after: '2026-06-01', month: 6 })
    expect(qs).toBe('date_after=2026-06-01&month=6')
  })
})
