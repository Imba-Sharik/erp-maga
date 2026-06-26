import { describe, expect, it } from 'vitest'

import { meetingCreateFormSchema, meetingFormSchema } from './meeting-form-schema'

describe('meetingFormSchema', () => {
  it('отклоняет пустые поля', () => {
    const result = meetingFormSchema.safeParse({
      title: '',
      comment: '',
      time: '',
      lofts: [],
      halls: [],
    })
    expect(result.success).toBe(false)
  })

  it('тримит пробелы и принимает валидные значения', () => {
    const result = meetingFormSchema.safeParse({
      title: '  Встреча  ',
      eventType: 'meeting',
      comment: '  Комментарий  ',
      time: '14:30',
      lofts: ['1'],
      halls: ['10'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Встреча')
      expect(result.data.comment).toBe('Комментарий')
    }
  })

  it('требует выбрать тип события', () => {
    const result = meetingFormSchema.safeParse({
      title: 'Встреча',
      eventType: '',
      comment: 'Комментарий',
      time: '14:30',
      lofts: ['1'],
      halls: ['10'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'eventType')).toBe(true)
    }
  })

  it('отклоняет невалидное время', () => {
    const result = meetingFormSchema.safeParse({
      title: 'Встреча',
      comment: 'Комментарий',
      time: '25:00',
      lofts: ['1'],
      halls: ['10'],
    })
    expect(result.success).toBe(false)
  })

  it('требует выбрать лофт и зал', () => {
    const result = meetingFormSchema.safeParse({
      title: 'Встреча',
      eventType: 'meeting',
      comment: 'Комментарий',
      time: '14:30',
      lofts: [],
      halls: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'lofts')).toBe(true)
      expect(result.error.issues.some((issue) => issue.path[0] === 'halls')).toBe(true)
    }
  })
})

describe('meetingCreateFormSchema', () => {
  const base = {
    title: 'Встреча',
    eventType: 'meeting',
    comment: 'Комментарий',
    lofts: ['1'],
    halls: ['10'],
  }

  it('требует время окончания', () => {
    const result = meetingCreateFormSchema.safeParse({ ...base, time: '14:30', endTime: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'endTime')).toBe(true)
    }
  })

  it('принимает валидный промежуток', () => {
    const result = meetingCreateFormSchema.safeParse({ ...base, time: '14:30', endTime: '15:30' })
    expect(result.success).toBe(true)
  })

  it('отклоняет окончание раньше или равное началу', () => {
    const earlier = meetingCreateFormSchema.safeParse({ ...base, time: '14:30', endTime: '14:00' })
    expect(earlier.success).toBe(false)
    if (!earlier.success) {
      expect(earlier.error.issues.some((issue) => issue.path[0] === 'endTime')).toBe(true)
    }

    const equal = meetingCreateFormSchema.safeParse({ ...base, time: '14:30', endTime: '14:30' })
    expect(equal.success).toBe(false)
  })
})
