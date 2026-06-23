import { describe, expect, it } from 'vitest'

import type { Reminder } from '@/entities/reminder'

import { canCreateReminder, canModifyReminder } from './reminder-permissions'

function reminder(managerId: number): Reminder {
  return {
    id: 1,
    managerId,
    title: 'Напоминание',
    comment: 'Комментарий',
    time: '14:30',
    date: '2026-06-10',
    notifyTelegram: false,
    sentAt: null,
    projectId: null,
  }
}

describe('canCreateReminder', () => {
  it('разрешает менеджеру и руководителю', () => {
    expect(canCreateReminder('manager')).toBe(true)
    expect(canCreateReminder('director')).toBe(true)
  })

  it('разрешает админу, запрещает бухгалтеру', () => {
    expect(canCreateReminder('admin')).toBe(true)
    expect(canCreateReminder('accountant')).toBe(false)
  })
})

describe('canModifyReminder', () => {
  it('менеджер правит любое видимое напоминание (видит только свои)', () => {
    expect(canModifyReminder({ role: 'manager', ownerId: 7, reminder: reminder(99) })).toBe(true)
  })

  it('руководитель правит только своё напоминание', () => {
    expect(canModifyReminder({ role: 'director', ownerId: 7, reminder: reminder(7) })).toBe(true)
  })

  it('руководитель не правит чужое напоминание', () => {
    expect(canModifyReminder({ role: 'director', ownerId: 7, reminder: reminder(8) })).toBe(false)
  })

  it('руководитель без загруженного id не правит ничего', () => {
    expect(canModifyReminder({ role: 'director', ownerId: null, reminder: reminder(7) })).toBe(
      false,
    )
  })

  it('админ правит только своё напоминание', () => {
    expect(canModifyReminder({ role: 'admin', ownerId: 7, reminder: reminder(7) })).toBe(true)
    expect(canModifyReminder({ role: 'admin', ownerId: 7, reminder: reminder(8) })).toBe(false)
  })

  it('бухгалтер не правит напоминания', () => {
    expect(canModifyReminder({ role: 'accountant', ownerId: 7, reminder: reminder(7) })).toBe(false)
  })
})
