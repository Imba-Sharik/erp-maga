import { describe, expect, it } from 'vitest'

import { toManagersDirectoryParams } from './to-managers-directory-params'

describe('toManagersDirectoryParams', () => {
  it('возвращает undefined без фильтра', () => {
    expect(toManagersDirectoryParams()).toBeUndefined()
  })

  it('мапит projectId в project_id', () => {
    expect(toManagersDirectoryParams({ projectId: 42 })).toEqual({ project_id: 42 })
  })

  it('мапит hallId и loftId', () => {
    expect(toManagersDirectoryParams({ hallId: 10, loftId: 2 })).toEqual({
      hall_id: 10,
      loft_id: 2,
    })
  })

  it('не добавляет loft_id без значения', () => {
    expect(toManagersDirectoryParams({ hallId: 10 })).toEqual({ hall_id: 10 })
  })
})
