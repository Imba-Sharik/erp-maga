// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MoneyInput } from './money-input'

afterEach(cleanup)

function renderInput(value: number | null, onCommit = vi.fn()) {
  render(<MoneyInput value={value} onCommit={onCommit} />)
  const input = screen.getByRole('textbox') as HTMLInputElement
  return { input, onCommit }
}

describe('MoneyInput', () => {
  it('в покое показывает округлённую сумму (formatMoney)', () => {
    const { input } = renderInput(55.4)
    expect(input.value).toBe('55 ₽')
  })

  it('на фокусе показывает округлённое целое, а не «реальную» дробь', () => {
    const { input } = renderInput(55.4)
    fireEvent.focus(input)
    expect(input.value).toBe('55')
  })

  // Регресс: 55.4 → focus вскрывал «55.4» → blur через digitsOnly превращал в 554.
  it('фокус→blur дробного значения не искажает сумму (55.4 → 55, не 554)', () => {
    const { input, onCommit } = renderInput(55.4)
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith(55)
    expect(onCommit).not.toHaveBeenCalledWith(554)
  })

  it('коммитит введённое число, отбрасывая нецифровые символы', () => {
    const { input, onCommit } = renderInput(null)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1 000' } })
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith(1000)
  })

  it('пустой ввод коммитит null', () => {
    const { input, onCommit } = renderInput(123)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith(null)
  })

  it('целое значение проходит фокус→blur без изменений', () => {
    const { input, onCommit } = renderInput(100)
    fireEvent.focus(input)
    expect(input.value).toBe('100')
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith(100)
  })
})
