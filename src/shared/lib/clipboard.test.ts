// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard, isClipboardCopySupported } from './clipboard'

// Свойства навигатора/документа переопределяем как собственные — они перекрывают
// прототипные методы jsdom, поэтому не зависят от конкретной версии окружения.
function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true })
}
function setExecCommand(value: unknown) {
  Object.defineProperty(document, 'execCommand', { value, configurable: true, writable: true })
}
function setQueryCommandSupported(value: unknown) {
  Object.defineProperty(document, 'queryCommandSupported', {
    value,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  setClipboard(undefined)
  setExecCommand(undefined)
  setQueryCommandSupported(undefined)
  vi.restoreAllMocks()
})

describe('copyTextToClipboard', () => {
  it('использует async Clipboard API, когда он доступен', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard({ writeText })
    await expect(copyTextToClipboard('v0.6.0')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('v0.6.0')
  })

  it('откатывается на execCommand, если async API отклонён', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    const execCommand = vi.fn().mockReturnValue(true)
    setExecCommand(execCommand)
    await expect(copyTextToClipboard('v0.6.0')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('использует execCommand, когда async Clipboard API нет', async () => {
    setExecCommand(vi.fn().mockReturnValue(true))
    await expect(copyTextToClipboard('v0.6.0')).resolves.toBe(true)
  })

  it('резолвится в false, когда скопировать нельзя', async () => {
    setExecCommand(vi.fn().mockReturnValue(false))
    await expect(copyTextToClipboard('v0.6.0')).resolves.toBe(false)
  })
})

describe('isClipboardCopySupported', () => {
  it('true при наличии async Clipboard API', () => {
    setClipboard({ writeText: vi.fn() })
    expect(isClipboardCopySupported()).toBe(true)
  })

  it('true, когда execCommand copy поддерживается', () => {
    setQueryCommandSupported(vi.fn().mockReturnValue(true))
    expect(isClipboardCopySupported()).toBe(true)
  })

  it('false без каких-либо возможностей копирования', () => {
    expect(isClipboardCopySupported()).toBe(false)
  })
})
