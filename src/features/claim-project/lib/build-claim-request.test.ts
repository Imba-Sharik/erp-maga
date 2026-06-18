import { describe, expect, it } from 'vitest'

import { buildClaimRequest } from './build-claim-request'

describe('buildClaimRequest', () => {
  it('возвращает числовой mag_manager_id текущего пользователя', () => {
    expect(buildClaimRequest('42')).toEqual({ mag_manager_id: 42 })
  })

  it('бросает для синтетического stub-id (до загрузки /users/me/)', () => {
    expect(() => buildClaimRequest('stub-manager')).toThrow('Invalid current user id')
  })

  it('бросает для нечислового id', () => {
    expect(() => buildClaimRequest('abc')).toThrow('Invalid current user id')
  })

  it('бросает для нуля и отрицательных id', () => {
    expect(() => buildClaimRequest('0')).toThrow('Invalid current user id')
    expect(() => buildClaimRequest('-5')).toThrow('Invalid current user id')
  })
})
