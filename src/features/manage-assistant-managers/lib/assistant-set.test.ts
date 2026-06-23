import { describe, expect, it } from 'vitest'

import type { ProjectAssistantManager } from '@/entities/project'

import { applyAssistantSelection } from './assistant-set'

const A: ProjectAssistantManager = { id: '1', fullName: 'Аникин' }
const B: ProjectAssistantManager = { id: '2', fullName: 'Бирюков' }
const C: ProjectAssistantManager = { id: '3', fullName: 'Власов' }

describe('applyAssistantSelection', () => {
  it('add — добавляет выбранного', () => {
    expect(applyAssistantSelection({ current: [A], mode: 'add', selected: B })).toEqual([A, B])
  })

  it('add — игнорирует дубликат', () => {
    expect(applyAssistantSelection({ current: [A], mode: 'add', selected: A })).toEqual([A])
  })

  it('add — null возвращает копию без изменений', () => {
    expect(applyAssistantSelection({ current: [A], mode: 'add', selected: null })).toEqual([A])
  })

  it('edit — заменяет редактируемого на выбранного', () => {
    expect(
      applyAssistantSelection({ current: [A, B], mode: 'edit', editingId: '2', selected: C }),
    ).toEqual([A, C])
  })

  it('edit — снимает при selected=null', () => {
    expect(
      applyAssistantSelection({ current: [A, B], mode: 'edit', editingId: '2', selected: null }),
    ).toEqual([A])
  })

  it('edit — без editingId возвращает копию', () => {
    expect(applyAssistantSelection({ current: [A, B], mode: 'edit', selected: C })).toEqual([A, B])
  })

  it('не мутирует вход', () => {
    const current = [A, B]
    applyAssistantSelection({ current, mode: 'edit', editingId: '2', selected: null })
    expect(current).toEqual([A, B])
  })
})
