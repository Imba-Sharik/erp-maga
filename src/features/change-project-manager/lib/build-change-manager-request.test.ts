import { describe, expect, it } from 'vitest'

import { buildChangeManagerRequest } from './build-change-manager-request'
import { UNASSIGN_PROJECT_MANAGER_ID } from './unassign-project-manager'

describe('buildChangeManagerRequest', () => {
  it('возвращает mag_manager_id: null для снятия назначения', () => {
    expect(buildChangeManagerRequest(UNASSIGN_PROJECT_MANAGER_ID)).toEqual({
      mag_manager_id: null,
    })
  })

  it('возвращает числовой mag_manager_id', () => {
    expect(buildChangeManagerRequest('42')).toEqual({ mag_manager_id: 42 })
  })

  it('бросает для невалидного id', () => {
    expect(() => buildChangeManagerRequest('abc')).toThrow('Invalid manager id')
  })
})
