import { describe, expect, it } from 'vitest'

import { meetingFormSchema } from './meeting-form-schema'

describe('meetingFormSchema', () => {
  it('отклоняет пустые поля', () => {
    const result = meetingFormSchema.safeParse({ title: '', comment: '', time: '' })
    expect(result.success).toBe(false)
  })

  it('тримит пробелы и принимает валидные значения', () => {
    const result = meetingFormSchema.safeParse({
      title: '  Встреча  ',
      comment: '  Комментарий  ',
      time: '14:30',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Встреча')
      expect(result.data.comment).toBe('Комментарий')
    }
  })

  it('отклоняет невалидное время', () => {
    const result = meetingFormSchema.safeParse({
      title: 'Встреча',
      comment: 'Комментарий',
      time: '25:00',
    })
    expect(result.success).toBe(false)
  })
})
