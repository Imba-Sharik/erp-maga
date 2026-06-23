import { describe, expect, it } from 'vitest'

import type { ManagerSelectOption } from '@/entities/manager'
import type { ProjectAssistantManager } from '@/entities/project'

import {
  buildAssistantCandidates,
  buildAssistantMenuItems,
  canShowAddAssistant,
} from './assistant-menu'

const DIRECTORY: ManagerSelectOption[] = [
  { id: '1', fullName: 'Аникин' },
  { id: '2', fullName: 'Бирюков' },
  { id: '3', fullName: 'Власов' },
  { id: 'name:Гость', fullName: 'Гость' },
]

describe('buildAssistantCandidates', () => {
  it('исключает синтетические name:*', () => {
    const result = buildAssistantCandidates({
      directoryOptions: DIRECTORY,
      leadManagerId: null,
      assignedAssistants: [],
    })
    expect(result.some((o) => o.id.startsWith('name:'))).toBe(false)
  })

  it('исключает ведущего', () => {
    const result = buildAssistantCandidates({
      directoryOptions: DIRECTORY,
      leadManagerId: '1',
      assignedAssistants: [],
    })
    expect(result.map((o) => o.id)).not.toContain('1')
  })

  it('исключает уже назначенных вспомогательных', () => {
    const assigned: ProjectAssistantManager[] = [{ id: '2', fullName: 'Бирюков' }]
    const result = buildAssistantCandidates({
      directoryOptions: DIRECTORY,
      leadManagerId: null,
      assignedAssistants: assigned,
    })
    expect(result.map((o) => o.id)).not.toContain('2')
  })

  it('в режиме «заменить» оставляет заменяемого', () => {
    const assigned: ProjectAssistantManager[] = [{ id: '2', fullName: 'Бирюков' }]
    const result = buildAssistantCandidates({
      directoryOptions: DIRECTORY,
      leadManagerId: null,
      assignedAssistants: assigned,
      excludeAssistantId: '2',
    })
    expect(result.map((o) => o.id)).toContain('2')
  })

  it('сортирует по имени (ru)', () => {
    const result = buildAssistantCandidates({
      directoryOptions: [
        { id: '3', fullName: 'Власов' },
        { id: '1', fullName: 'Аникин' },
      ],
      leadManagerId: null,
      assignedAssistants: [],
    })
    expect(result.map((o) => o.fullName)).toEqual(['Аникин', 'Власов'])
  })

  it('пусто, если все исключены', () => {
    const result = buildAssistantCandidates({
      directoryOptions: [{ id: '1', fullName: 'Аникин' }],
      leadManagerId: '1',
      assignedAssistants: [],
    })
    expect(result).toEqual([])
  })

  it('leadManagerId=null никого не исключает как ведущего', () => {
    const result = buildAssistantCandidates({
      directoryOptions: [{ id: '1', fullName: 'Аникин' }],
      leadManagerId: null,
      assignedAssistants: [],
    })
    expect(result.map((o) => o.id)).toEqual(['1'])
  })
})

describe('canShowAddAssistant', () => {
  it('false, если не ведущий', () => {
    expect(canShowAddAssistant({ isLeadManager: false, assignableCandidates: [{ id: '1' }] })).toBe(
      false,
    )
  })

  it('false, если нет кандидатов', () => {
    expect(canShowAddAssistant({ isLeadManager: true, assignableCandidates: [] })).toBe(false)
  })

  it('true, если ведущий и есть кандидат', () => {
    expect(canShowAddAssistant({ isLeadManager: true, assignableCandidates: [{ id: '1' }] })).toBe(
      true,
    )
  })
})

describe('buildAssistantMenuItems', () => {
  it('строит пункты из назначенных', () => {
    expect(buildAssistantMenuItems([{ id: '2', fullName: 'Бирюков' }])).toEqual([
      { id: '2', fullName: 'Бирюков' },
    ])
  })

  it('пусто без вспомогательных', () => {
    expect(buildAssistantMenuItems([])).toEqual([])
  })

  it('сортирует по имени (ru)', () => {
    const items = buildAssistantMenuItems([
      { id: '3', fullName: 'Власов' },
      { id: '1', fullName: 'Аникин' },
    ])
    expect(items.map((i) => i.fullName)).toEqual(['Аникин', 'Власов'])
  })
})
