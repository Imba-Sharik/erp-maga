import { describe, expect, it } from 'vitest'

import { diffAssistantManagers } from './diff-assistant-managers'

describe('diffAssistantManagers', () => {
  it('пустые наборы → нечего делать', () => {
    expect(diffAssistantManagers([], [])).toEqual({ toAdd: [], toRemove: [] })
  })

  it('только добавления', () => {
    expect(diffAssistantManagers([], ['2', '3'])).toEqual({ toAdd: [2, 3], toRemove: [] })
  })

  it('только снятия', () => {
    expect(diffAssistantManagers(['2', '3'], [])).toEqual({ toAdd: [], toRemove: [2, 3] })
  })

  it('без изменений → пусто', () => {
    expect(diffAssistantManagers(['1', '2'], ['2', '1'])).toEqual({ toAdd: [], toRemove: [] })
  })

  it('пересечение: часть добавить, часть снять, общих не трогать', () => {
    expect(diffAssistantManagers(['1', '2'], ['2', '3'])).toEqual({ toAdd: [3], toRemove: [1] })
  })

  it('игнорирует синтетические/нечисловые id', () => {
    expect(diffAssistantManagers(['name:Иванов'], ['5', 'name:Петров'])).toEqual({
      toAdd: [5],
      toRemove: [],
    })
  })

  it('возвращает number-id для путей/тел запросов', () => {
    const { toAdd } = diffAssistantManagers([], ['42'])
    expect(toAdd[0]).toBe(42)
    expect(typeof toAdd[0]).toBe('number')
  })
})
