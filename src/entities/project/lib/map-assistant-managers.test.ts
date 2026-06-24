import { describe, expect, it } from 'vitest'

import { mapAssistantManagers } from './map-assistant-managers'

describe('mapAssistantManagers', () => {
  it('возвращает [] для undefined', () => {
    expect(mapAssistantManagers(undefined)).toEqual([])
  })

  it('возвращает [] для null', () => {
    expect(mapAssistantManagers(null)).toEqual([])
  })

  it('берёт идентичность из manager_id (user id), а не из id строки связи', () => {
    expect(mapAssistantManagers([{ id: 99, manager_id: 7, full_name: 'Петров Пётр' }])).toEqual([
      { id: '7', fullName: 'Петров Пётр' },
    ])
  })

  it('подставляет пустое имя при отсутствии full_name', () => {
    expect(mapAssistantManagers([{ id: 10, manager_id: 3 }])).toEqual([{ id: '3', fullName: '' }])
    expect(mapAssistantManagers([{ id: 11, manager_id: 4, full_name: null }])).toEqual([
      { id: '4', fullName: '' },
    ])
  })

  it('сохраняет порядок элементов', () => {
    const result = mapAssistantManagers([
      { id: 20, manager_id: 2, full_name: 'Бирюков' },
      { id: 21, manager_id: 1, full_name: 'Аникин' },
    ])
    expect(result.map((m) => m.id)).toEqual(['2', '1'])
  })

  it('маппит несколько элементов', () => {
    expect(
      mapAssistantManagers([
        { id: 30, manager_id: 1, full_name: 'Аникин' },
        { id: 31, manager_id: 2, full_name: 'Бирюков' },
      ]),
    ).toHaveLength(2)
  })
})
