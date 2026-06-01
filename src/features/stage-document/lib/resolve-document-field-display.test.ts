import { describe, expect, it } from 'vitest'

import { resolveStageDocumentFieldDisplay } from './resolve-document-field-display'

/**
 * Спецификация отображения поля документа в UI.
 * Placeholder в download-режиме нужен на read-only карточках (закрытые запросы).
 */
describe('resolveStageDocumentFieldDisplay', () => {
  const FILE = 'closing.pdf'

  describe('download (read-only)', () => {
    it('empty без файла → placeholder-empty', () => {
      expect(resolveStageDocumentFieldDisplay('empty', '', 'download')).toBe('placeholder-empty')
    })

    it('rejected без файла → placeholder-rejected', () => {
      expect(resolveStageDocumentFieldDisplay('rejected', '', 'download')).toBe(
        'placeholder-rejected',
      )
    })

    it('confirmed с файлом → file-row', () => {
      expect(resolveStageDocumentFieldDisplay('confirmed', FILE, 'download')).toBe('file-row')
    })

    it('uploaded с файлом → file-row', () => {
      expect(resolveStageDocumentFieldDisplay('uploaded', FILE, 'download')).toBe('file-row')
    })
  })

  describe('upload (редактируемая форма)', () => {
    it('empty без файла → upload-button', () => {
      expect(resolveStageDocumentFieldDisplay('empty', '', 'upload')).toBe('upload-button')
    })

    it('rejected без файла → upload-button', () => {
      expect(resolveStageDocumentFieldDisplay('rejected', '', 'upload')).toBe('upload-button')
    })

    it('confirmed с файлом → file-row', () => {
      expect(resolveStageDocumentFieldDisplay('confirmed', FILE, 'upload')).toBe('file-row')
    })
  })
})
