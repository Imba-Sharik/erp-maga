import { describe, expect, it } from 'vitest'

import { mapAssistantManagers } from './map-assistant-managers'

describe('mapAssistantManagers', () => {
  it('возвращает [] для undefined', () => {
    expect(mapAssistantManagers(undefined)).toEqual([])
  })

  it('возвращает [] для null', () => {
    expect(mapAssistantManagers(null)).toEqual([])
  })

  it('приводит id к строке и берёт full_name', () => {
    expect(mapAssistantManagers([{ id: 7, full_name: 'Петров Пётр' }])).toEqual([
      { id: '7', fullName: 'Петров Пётр' },
    ])
  })

  it('подставляет пустое имя при отсутствии full_name', () => {
    expect(mapAssistantManagers([{ id: 3 }])).toEqual([{ id: '3', fullName: '' }])
    expect(mapAssistantManagers([{ id: 4, full_name: null }])).toEqual([{ id: '4', fullName: '' }])
  })

  it('сохраняет порядок элементов', () => {
    const result = mapAssistantManagers([
      { id: 2, full_name: 'Бирюков' },
      { id: 1, full_name: 'Аникин' },
    ])
    expect(result.map((m) => m.id)).toEqual(['2', '1'])
  })

  it('маппит несколько элементов', () => {
    expect(
      mapAssistantManagers([
        { id: 1, full_name: 'Аникин' },
        { id: 2, full_name: 'Бирюков' },
      ]),
    ).toHaveLength(2)
  })
})
