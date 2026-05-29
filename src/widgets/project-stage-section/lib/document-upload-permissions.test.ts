import { describe, expect, it } from 'vitest'

import { isDocumentUploadLocked } from './document-upload-permissions'

/**
 * Спецификация прав на загрузку/замену файла закрывающего документа.
 *
 * Ключевое бизнес-правило — приоритет бухгалтера: документ в статусе «Есть»
 * подтверждён бухгалтерией, поэтому менеджер его уже не трогает. Менеджер
 * грузит файл только пока статус не выставлен или в «Повторный запрос».
 *
 * `true` = загрузка/замена заблокированы. Скачивание файла от этой блокировки
 * не зависит и доступно всегда.
 */
describe('isDocumentUploadLocked', () => {
  it('поле недоступно для редактирования → заблокировано для любой роли', () => {
    expect(isDocumentUploadLocked('manager', undefined, false)).toBe(true)
    expect(isDocumentUploadLocked('accountant', undefined, false)).toBe(true)
    expect(isDocumentUploadLocked('manager', 're_requested', false)).toBe(true)
  })

  describe('статус «Не требуется» (not_required) — замена выключена у всех', () => {
    it('менеджер заблокирован', () => {
      expect(isDocumentUploadLocked('manager', 'not_required', true)).toBe(true)
    })
    it('бухгалтер заблокирован', () => {
      expect(isDocumentUploadLocked('accountant', 'not_required', true)).toBe(true)
    })
  })

  describe('статус «Есть» (present) — приоритет бухгалтера', () => {
    it('менеджер НЕ может менять подтверждённый документ', () => {
      expect(isDocumentUploadLocked('manager', 'present', true)).toBe(true)
    })
    it('бухгалтер может перезалить подтверждённый документ', () => {
      expect(isDocumentUploadLocked('accountant', 'present', true)).toBe(false)
    })
  })

  describe('статус «Повторный запрос» (re_requested) — загрузка доступна', () => {
    it('менеджер может догрузить файл', () => {
      expect(isDocumentUploadLocked('manager', 're_requested', true)).toBe(false)
    })
    it('бухгалтер может загрузить файл', () => {
      expect(isDocumentUploadLocked('accountant', 're_requested', true)).toBe(false)
    })
  })

  describe('статус ещё не выставлен — загрузка доступна', () => {
    it('менеджер может загрузить первый файл', () => {
      expect(isDocumentUploadLocked('manager', undefined, true)).toBe(false)
    })
    it('бухгалтер может загрузить первый файл', () => {
      expect(isDocumentUploadLocked('accountant', undefined, true)).toBe(false)
    })
  })
})
