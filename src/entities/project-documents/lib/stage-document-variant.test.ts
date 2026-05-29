import { describe, expect, it } from 'vitest'

import { getStageDocumentFieldVariant } from './stage-document-variant'

/**
 * Спецификация подсветки поля закрывающего документа.
 *
 * Вариант определяет цвет поля в UI:
 * - `empty`     — файла нет, поле пустое;
 * - `uploaded`  — файл есть, но статус ещё не подтверждён (серый/нейтральный);
 * - `confirmed` — статус «Есть» (зелёный), документ принят;
 * - `rejected`  — статус «Повторный запрос», ожидается свежий файл (красный).
 *
 * Источник правды для «красного» в re_requested — сравнение времени:
 * файл считается «догруженным после повторного запроса», если `uploaded_at`
 * ИЛИ `reuploaded_at` (с бэка) не раньше `confirmed_at` (время повторного запроса).
 */
describe('getStageDocumentFieldVariant', () => {
  const FILE = 'closing.pdf'

  describe('без статуса', () => {
    it('пустое поле без файла → empty', () => {
      expect(getStageDocumentFieldVariant(undefined, undefined)).toBe('empty')
    })

    it('загруженный файл без статуса → uploaded', () => {
      expect(getStageDocumentFieldVariant(FILE, undefined)).toBe('uploaded')
    })
  })

  describe('статус «Есть» (present)', () => {
    it('present с файлом → confirmed (зелёный, у любой роли)', () => {
      expect(getStageDocumentFieldVariant(FILE, 'present')).toBe('confirmed')
    })

    it('present без файла → empty (нечего подсвечивать зелёным)', () => {
      expect(getStageDocumentFieldVariant(undefined, 'present')).toBe('empty')
    })
  })

  describe('статус «Не требуется» (not_required)', () => {
    it('not_required с файлом → uploaded (нейтральный, не зелёный/не красный)', () => {
      expect(getStageDocumentFieldVariant(FILE, 'not_required')).toBe('uploaded')
    })

    it('not_required без файла → empty', () => {
      expect(getStageDocumentFieldVariant(undefined, 'not_required')).toBe('empty')
    })
  })

  describe('статус «Повторный запрос» (re_requested)', () => {
    it('re_requested без файла → rejected (красный, ждём загрузку)', () => {
      expect(getStageDocumentFieldVariant(undefined, 're_requested')).toBe('rejected')
    })

    it('файл загружен ДО повторного запроса (uploaded_at < confirmed_at) → rejected', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        uploadedAt: '2026-05-01T10:00:00Z',
        confirmedAt: '2026-05-10T10:00:00Z',
      })
      expect(variant).toBe('rejected')
    })

    it('красный держится после reload, пока файл не догрузили (только confirmed_at, без reupload)', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        confirmedAt: '2026-05-10T10:00:00Z',
      })
      expect(variant).toBe('rejected')
    })

    it('менеджер догрузил файл после запроса (reuploaded_at >= confirmed_at) → uploaded, красный снят', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        confirmedAt: '2026-05-10T10:00:00Z',
        reuploadedAt: '2026-05-10T12:00:00Z',
      })
      expect(variant).toBe('uploaded')
    })

    it('бэк обновил file.uploaded_at позже confirmed_at → uploaded, даже без reuploaded_at', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        confirmedAt: '2026-05-10T10:00:00Z',
        uploadedAt: '2026-05-10T11:00:00Z',
      })
      expect(variant).toBe('uploaded')
    })

    it('uploaded_at ровно равен confirmed_at → uploaded (граница включительно)', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        confirmedAt: '2026-05-10T10:00:00Z',
        uploadedAt: '2026-05-10T10:00:00Z',
      })
      expect(variant).toBe('uploaded')
    })

    it('нет confirmed_at → не можем доказать догрузку → rejected', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        uploadedAt: '2026-05-10T11:00:00Z',
      })
      expect(variant).toBe('rejected')
    })

    it('некорректные даты игнорируются → rejected', () => {
      const variant = getStageDocumentFieldVariant(FILE, 're_requested', {
        confirmedAt: 'not-a-date',
        reuploadedAt: 'also-bad',
      })
      expect(variant).toBe('rejected')
    })
  })
})
