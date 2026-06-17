import { describe, expect, it } from 'vitest'

import { resolveStageEditAccess } from './resolve-stage-edit-access'

describe('resolveStageEditAccess', () => {
  it('менеджер ведёт свой этап, когда проект не read-only', () => {
    expect(resolveStageEditAccess('primary_contact_done', 'manager', false)).toEqual({
      canEdit: true,
      canAdvance: true,
    })
  })

  it('read-only гасит права даже у разрешённой роли', () => {
    expect(resolveStageEditAccess('primary_contact_done', 'manager', true)).toEqual({
      canEdit: false,
      canAdvance: false,
    })
  })

  it('роль без прав на этап остаётся без прав и без read-only', () => {
    expect(resolveStageEditAccess('data_confirmed', 'manager', false)).toEqual({
      canEdit: false,
      canAdvance: false,
    })
  })
})
