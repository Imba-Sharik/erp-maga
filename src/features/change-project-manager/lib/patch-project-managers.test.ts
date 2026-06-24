import { describe, expect, it } from 'vitest'

import type { Project } from '@/entities/project'

import { patchProjectManagers } from './patch-project-managers'

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: '7',
    title: 'Проект',
    date: '2026-07-01',
    stage: 'event_held',
    city: 'Москва',
    loft: 'Лофт',
    hall: 'Зал',
    manager: '',
    canClaim: false,
    canEdit: false,
    isReadOnly: false,
    type: 'Тип',
    company: 'Компания',
    phone: '',
    email: '',
    plumCardUrl: '',
    isFromPlum: false,
    plumEventStatus: null,
    plumEventStatusLabel: null,
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }
}

describe('patchProjectManagers', () => {
  it('ставит ведущего и его имя', () => {
    const result = patchProjectManagers(makeProject(), {
      leadId: '1',
      leadName: 'Иванов',
      assistants: [],
      currentUserId: '9',
    })
    expect(result).toMatchObject({ manager: 'Иванов', leadManagerId: '1' })
  })

  it('кладёт вспомогательных в assistantManagers (роль выводится на UI, не флагом)', () => {
    const result = patchProjectManagers(makeProject(), {
      leadId: '1',
      leadName: 'Иванов',
      assistants: [{ id: '9', fullName: 'Я' }],
      currentUserId: '9',
    })
    expect(result.assistantManagers).toEqual([{ id: '9', fullName: 'Я' }])
  })

  it('canEdit=true для ведущего', () => {
    const result = patchProjectManagers(makeProject({ canEdit: false }), {
      leadId: '9',
      leadName: 'Я',
      assistants: [],
      currentUserId: '9',
    })
    expect(result.canEdit).toBe(true)
  })

  it('canEdit=true для вспомогательного', () => {
    const result = patchProjectManagers(makeProject({ canEdit: false }), {
      leadId: '1',
      leadName: 'Иванов',
      assistants: [{ id: '9', fullName: 'Я' }],
      currentUserId: '9',
    })
    expect(result.canEdit).toBe(true)
  })

  it('canEdit=false, если пользователь ни ведущий, ни вспомогательный', () => {
    const result = patchProjectManagers(makeProject({ canEdit: false }), {
      leadId: '1',
      leadName: 'Иванов',
      assistants: [],
      currentUserId: '9',
    })
    expect(result.canEdit).toBe(false)
  })

  it('снять всё → assistantManagers=[], лид null, имя пустое', () => {
    const result = patchProjectManagers(makeProject({ manager: 'X' }), {
      leadId: null,
      leadName: '',
      assistants: [],
      currentUserId: '9',
    })
    expect(result.assistantManagers).toEqual([])
    expect(result.leadManagerId).toBeNull()
    expect(result.manager).toBe('')
  })

  it('не мутирует вход', () => {
    const project = makeProject({ manager: 'X' })
    patchProjectManagers(project, {
      leadId: '1',
      leadName: 'И',
      assistants: [],
      currentUserId: '9',
    })
    expect(project.manager).toBe('X')
  })
})
