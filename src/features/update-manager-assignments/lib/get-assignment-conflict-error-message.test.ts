import axios from 'axios'
import { describe, expect, it } from 'vitest'

import { getAssignmentConflictErrorMessage } from './get-assignment-conflict-error-message'

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

describe('getAssignmentConflictErrorMessage', () => {
  describe('assignment_conflict', () => {
    it('возвращает detail как есть', () => {
      expect(
        getAssignmentConflictErrorMessage(
          clientError({
            code: 'assignment_conflict',
            detail: 'Связка hall+loft уже занята',
            invalid_loft_ids: [2],
          }),
        ),
      ).toBe('Связка hall+loft уже занята')
    })

    it('дополняет detail именами лофтов, если их нет в тексте', () => {
      const loftIdToName = new Map([[2, 'Loft Центр']])
      expect(
        getAssignmentConflictErrorMessage(
          clientError({
            code: 'assignment_conflict',
            detail: 'Конфликт назначения',
            invalid_loft_ids: [2],
          }),
          loftIdToName,
        ),
      ).toBe('Конфликт назначения (Loft Центр)')
    })

    it('не дублирует имя лофта, если оно уже в detail', () => {
      const loftIdToName = new Map([[2, 'Loft Центр']])
      expect(
        getAssignmentConflictErrorMessage(
          clientError({
            code: 'assignment_conflict',
            detail: 'Занят Loft Центр',
            invalid_loft_ids: [2],
          }),
          loftIdToName,
        ),
      ).toBe('Занят Loft Центр')
    })

    it('фолбэк с именами лофтов при пустом detail', () => {
      const loftIdToName = new Map([
        [2, 'Loft A'],
        [3, 'Loft B'],
      ])
      expect(
        getAssignmentConflictErrorMessage(
          clientError({
            code: 'assignment_conflict',
            detail: '',
            invalid_loft_ids: [2, 3],
          }),
          loftIdToName,
        ),
      ).toBe('Эта привязка уже назначена другому менеджеру: Loft A, Loft B')
    })

    it('общий фолбэк при пустом detail и без карты лофтов', () => {
      expect(
        getAssignmentConflictErrorMessage(
          clientError({
            code: 'assignment_conflict',
            detail: '',
            invalid_loft_ids: [],
          }),
        ),
      ).toBe('Эта привязка уже назначена другому менеджеру')
    })
  })

  describe('прочие тела ответа', () => {
    it('берёт detail без code assignment_conflict', () => {
      expect(
        getAssignmentConflictErrorMessage(clientError({ detail: 'Произвольная ошибка' })),
      ).toBe('Произвольная ошибка')
    })
  })

  describe('фолбэк по HTTP-статусу', () => {
    it('400 без тела → конфликт назначения', () => {
      expect(getAssignmentConflictErrorMessage(clientError({}, 400))).toBe(
        'Эта привязка уже назначена другому менеджеру',
      )
    })

    it('403 → нет прав', () => {
      expect(getAssignmentConflictErrorMessage(clientError({}, 403))).toBe(
        'Нет прав на изменение привязок',
      )
    })

    it('401 → авторизация', () => {
      expect(getAssignmentConflictErrorMessage(clientError({}, 401))).toBe('Требуется авторизация')
    })
  })

  describe('axios', () => {
    it('разбирает тело assignment_conflict', () => {
      expect(
        getAssignmentConflictErrorMessage(
          axiosError({
            code: 'assignment_conflict',
            detail: 'Из axios',
            invalid_loft_ids: [],
          }),
        ),
      ).toBe('Из axios')
    })
  })

  describe('неизвестная ошибка', () => {
    it('возвращает общий фолбэк', () => {
      expect(getAssignmentConflictErrorMessage(new Error('boom'))).toBe(
        'Не удалось сохранить привязки',
      )
      expect(getAssignmentConflictErrorMessage(null)).toBe('Не удалось сохранить привязки')
    })
  })
})
