import { describe, expect, it } from 'vitest'

import { getDocumentUploadErrorMessage } from './get-document-upload-error-message'

/**
 * Спецификация текста ошибки при загрузке закрывающего документа.
 *
 * Источник сообщения — тело ответа клиента (`ResponseErrorConfig.error`).
 * Поля DRF разбираются по приоритету `detail` → `file` → `non_field_errors`,
 * и только потом — первое попавшееся строковое поле. Если тело пустое —
 * показываем человекочитаемый фолбэк по HTTP-статусу.
 */
function clientError(body: unknown, status = 400) {
  return { error: body, status } as unknown
}

describe('getDocumentUploadErrorMessage', () => {
  describe('разбор тела ответа (приоритет полей DRF)', () => {
    it('берёт detail в первую очередь', () => {
      expect(getDocumentUploadErrorMessage(clientError({ detail: 'Доступ запрещён' }))).toBe(
        'Доступ запрещён',
      )
    })

    it('detail приоритетнее других полей', () => {
      const message = getDocumentUploadErrorMessage(
        clientError({ file: ['Слишком большой файл'], detail: 'Главная причина' }),
      )
      expect(message).toBe('Главная причина')
    })

    it('поле file приоритетнее произвольных полей формы', () => {
      const message = getDocumentUploadErrorMessage(
        clientError({ some_other_field: 'неважное', file: ['Недопустимый формат'] }),
      )
      expect(message).toBe('Недопустимый формат')
    })

    it('non_field_errors берётся, если нет detail/file', () => {
      const message = getDocumentUploadErrorMessage(
        clientError({ non_field_errors: ['Общая ошибка валидации'] }),
      )
      expect(message).toBe('Общая ошибка валидации')
    })

    it('падает на первое строковое поле, если приоритетных нет', () => {
      expect(getDocumentUploadErrorMessage(clientError({ custom: 'Что-то пошло не так' }))).toBe(
        'Что-то пошло не так',
      )
    })

    it('из массива берёт первый элемент', () => {
      expect(getDocumentUploadErrorMessage(clientError({ file: ['Первая', 'Вторая'] }))).toBe(
        'Первая',
      )
    })
  })

  describe('фолбэк по HTTP-статусу при пустом теле', () => {
    it('403 → нет прав', () => {
      expect(getDocumentUploadErrorMessage(clientError({}, 403))).toBe(
        'Нет прав на загрузку документа',
      )
    })

    it('401 → требуется авторизация', () => {
      expect(getDocumentUploadErrorMessage(clientError({}, 401))).toBe('Требуется авторизация')
    })

    it('400 → не удалось загрузить файл', () => {
      expect(getDocumentUploadErrorMessage(clientError({}, 400))).toBe('Не удалось загрузить файл')
    })
  })

  describe('неизвестная ошибка', () => {
    it('возвращает общий фолбэк', () => {
      expect(getDocumentUploadErrorMessage(new Error('boom'))).toBe('Не удалось загрузить файл')
      expect(getDocumentUploadErrorMessage(null)).toBe('Не удалось загрузить файл')
    })
  })
})
