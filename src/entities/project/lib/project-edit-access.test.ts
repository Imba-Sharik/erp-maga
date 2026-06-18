import { describe, expect, it } from 'vitest'

import { resolveProjectReadOnly } from './project-edit-access'

describe('resolveProjectReadOnly', () => {
  it('true для проекта из пула / взятого другим (is_read_only)', () => {
    expect(resolveProjectReadOnly({ isReadOnly: true, canEdit: false })).toBe(true)
  })

  it('true, когда нет права редактирования', () => {
    expect(resolveProjectReadOnly({ isReadOnly: false, canEdit: false })).toBe(true)
  })

  it('false для владельца/руководителя (can_edit без read-only)', () => {
    expect(resolveProjectReadOnly({ isReadOnly: false, canEdit: true })).toBe(false)
  })
})
