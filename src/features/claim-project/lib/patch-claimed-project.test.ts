import { describe, expect, it } from 'vitest'

import type { Project } from '@/entities/project'

import { patchClaimedProject } from './patch-claimed-project'

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: '7',
    title: 'Проект из пула',
    date: '2026-07-01',
    stage: 'plum_request',
    city: 'Москва',
    loft: 'LOFT#1',
    hall: 'MAIN',
    manager: '',
    canClaim: true,
    canEdit: false,
    isReadOnly: true,
    type: 'Корпоратив',
    company: 'ООО Ромашка',
    phone: '+7 999 000-00-00',
    email: '',
    plumCardUrl: '',
    isFromPlum: false,
    plumEventStatus: null,
    plumEventStatusLabel: null,
    updatedAt: '2026-06-01T00:00:00Z',
    createdAt: '2026-05-01T00:00:00Z',
    ...overrides,
  }
}

describe('patchClaimedProject', () => {
  it('делает текущего пользователя менеджером и снимает режим просмотра', () => {
    const result = patchClaimedProject(makeProject(), { fullName: 'Петров Пётр' })

    expect(result).toMatchObject({
      manager: 'Петров Пётр',
      canClaim: false,
      canEdit: true,
      isReadOnly: false,
    })
  })

  it('не мутирует исходный проект', () => {
    const project = makeProject({ canClaim: true })
    patchClaimedProject(project, { fullName: 'X' })

    expect(project.canClaim).toBe(true)
    expect(project.manager).toBe('')
  })
})
