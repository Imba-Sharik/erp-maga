import { describe, expect, it } from 'vitest'

import {
  PROJECTS_SORT_DEFAULT,
  PROJECTS_SORT_FIELD_CREATED,
  buildProjectsSortValue,
  parseProjectsSort,
} from './projects-sort-catalog'

describe('parseProjectsSort', () => {
  it('читает убывание из префикса "-"', () => {
    expect(parseProjectsSort('-created_at')).toEqual({ field: 'created_at', direction: 'desc' })
  })

  it('читает возрастание без префикса', () => {
    expect(parseProjectsSort('event_date')).toEqual({ field: 'event_date', direction: 'asc' })
  })

  it('значение по умолчанию — created_at по убыванию', () => {
    expect(parseProjectsSort(PROJECTS_SORT_DEFAULT)).toEqual({
      field: PROJECTS_SORT_FIELD_CREATED,
      direction: 'desc',
    })
  })
})

describe('buildProjectsSortValue', () => {
  it('добавляет "-" для убывания', () => {
    expect(buildProjectsSortValue('event_date', 'desc')).toBe('-event_date')
  })

  it('оставляет поле как есть для возрастания', () => {
    expect(buildProjectsSortValue('created_at', 'asc')).toBe('created_at')
  })

  it('round-trip сохраняет значение ordering', () => {
    for (const value of ['-created_at', 'created_at', 'event_date', '-event_date']) {
      const { field, direction } = parseProjectsSort(value)
      expect(buildProjectsSortValue(field, direction)).toBe(value)
    }
  })
})
