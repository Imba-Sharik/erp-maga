import axios from 'axios'
import { describe, expect, it } from 'vitest'

import { getAssignmentErrorMessage } from './get-assignment-error-message'

function clientError(body: unknown, status = 400) {
  return { error: body, status } as unknown
}

function axiosError(body: unknown, status = 400) {
  return new axios.AxiosError('request failed', undefined, undefined, undefined, {
    status,
    data: body,
    statusText: '',
    headers: {},
    config: {} as never,
  })
}

describe('getAssignmentErrorMessage', () => {
  describe('тело ответа с detail', () => {
    it('возвращает detail как есть', () => {
      expect(getAssignmentErrorMessage(clientError({ detail: 'Произвольная ошибка' }))).toBe(
        'Произвольная ошибка',
      )
    })
  })

  describe('фолбэк по HTTP-статусу', () => {
    it('400 без тела → общий фолбэк сохранения', () => {
      expect(getAssignmentErrorMessage(clientError({}, 400))).toBe('Не удалось сохранить привязки')
    })

    it('403 → нет прав', () => {
      expect(getAssignmentErrorMessage(clientError({}, 403))).toBe('Нет прав на изменение привязок')
    })

    it('401 → авторизация', () => {
      expect(getAssignmentErrorMessage(clientError({}, 401))).toBe('Требуется авторизация')
    })
  })

  describe('axios', () => {
    it('разбирает detail из тела', () => {
      expect(getAssignmentErrorMessage(axiosError({ detail: 'Из axios' }))).toBe('Из axios')
    })
  })

  describe('неизвестная ошибка', () => {
    it('возвращает общий фолбэк', () => {
      expect(getAssignmentErrorMessage(new Error('boom'))).toBe('Не удалось сохранить привязки')
      expect(getAssignmentErrorMessage(null)).toBe('Не удалось сохранить привязки')
    })
  })
})
