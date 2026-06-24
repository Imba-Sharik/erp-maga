import { describe, expect, it } from 'vitest'

import { isProjectAssistantManager, isProjectLeadManager } from './resolve-manager-role'

describe('isProjectLeadManager', () => {
  it('true, если leadManagerId === текущему пользователю', () => {
    expect(isProjectLeadManager({ leadManagerId: '9' }, '9')).toBe(true)
  })

  it('false, если ведущий — другой', () => {
    expect(isProjectLeadManager({ leadManagerId: '1' }, '9')).toBe(false)
  })

  it('false, если ведущий не назначен (null/undefined)', () => {
    expect(isProjectLeadManager({ leadManagerId: null }, '9')).toBe(false)
    expect(isProjectLeadManager({}, '9')).toBe(false)
  })
})

describe('isProjectAssistantManager', () => {
  it('true, если пользователь среди вспомогательных (по user id)', () => {
    expect(
      isProjectAssistantManager(
        {
          assistantManagers: [
            { id: '3', fullName: 'А' },
            { id: '9', fullName: 'Я' },
          ],
        },
        '9',
      ),
    ).toBe(true)
  })

  it('false, если пользователя нет среди вспомогательных', () => {
    expect(
      isProjectAssistantManager({ assistantManagers: [{ id: '3', fullName: 'А' }] }, '9'),
    ).toBe(false)
  })

  it('false при отсутствии вспомогательных', () => {
    expect(isProjectAssistantManager({ assistantManagers: [] }, '9')).toBe(false)
    expect(isProjectAssistantManager({}, '9')).toBe(false)
  })
})
