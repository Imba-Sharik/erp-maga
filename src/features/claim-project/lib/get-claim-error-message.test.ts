import { describe, expect, it } from 'vitest'

import { getClaimErrorMessage } from './get-claim-error-message'

function axiosError(status: number, data?: unknown) {
  return { isAxiosError: true, response: { status, data } }
}

describe('getClaimErrorMessage', () => {
  it('показывает detail из тела (400 — проект уже взят)', () => {
    expect(
      getClaimErrorMessage(axiosError(400, { detail: 'Проект уже взят другим менеджером' })),
    ).toBe('Проект уже взят другим менеджером')
  })

  it('показывает detail из тела (400 — нет привязки к залу)', () => {
    expect(getClaimErrorMessage(axiosError(400, { detail: 'Вы не закреплены за залом' }))).toBe(
      'Вы не закреплены за залом',
    )
  })

  it('дефолт для 403 без detail (чужой id)', () => {
    expect(getClaimErrorMessage(axiosError(403))).toBe('Нет прав на выполнение операции')
  })

  it('fallback для неизвестной ошибки', () => {
    expect(getClaimErrorMessage(new Error('boom'))).toBe('Не удалось взять проект')
  })
})
