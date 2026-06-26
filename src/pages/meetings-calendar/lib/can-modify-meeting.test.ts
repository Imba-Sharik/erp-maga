import { describe, expect, it } from 'vitest'

import type { Meeting } from '@/entities/meeting'

import { canCreateMeeting, canModifyMeeting } from './can-modify-meeting'

function meeting(managerId: number): Meeting {
  return {
    id: 1,
    title: 'Встреча',
    eventType: 'meeting',
    comment: 'Комментарий',
    time: '14:30',
    date: '2026-06-10',
    managerId,
    halls: [],
  }
}

describe('canCreateMeeting', () => {
  it('разрешает менеджеру и руководителю', () => {
    expect(canCreateMeeting('manager')).toBe(true)
    expect(canCreateMeeting('director')).toBe(true)
  })

  it('запрещает админу и бухгалтеру', () => {
    expect(canCreateMeeting('admin')).toBe(false)
    expect(canCreateMeeting('accountant')).toBe(false)
  })
})

describe('canModifyMeeting', () => {
  it('менеджер правит любую видимую встречу (видит только свои)', () => {
    expect(canModifyMeeting({ role: 'manager', ownerId: 7, meeting: meeting(99) })).toBe(true)
  })

  it('руководитель правит только свою встречу', () => {
    expect(canModifyMeeting({ role: 'director', ownerId: 7, meeting: meeting(7) })).toBe(true)
  })

  it('руководитель не правит чужую встречу', () => {
    expect(canModifyMeeting({ role: 'director', ownerId: 7, meeting: meeting(8) })).toBe(false)
  })

  it('руководитель без загруженного id не правит ничего', () => {
    expect(canModifyMeeting({ role: 'director', ownerId: null, meeting: meeting(7) })).toBe(false)
  })

  it('прочие роли не правят встречи', () => {
    expect(canModifyMeeting({ role: 'admin', ownerId: 7, meeting: meeting(7) })).toBe(false)
    expect(canModifyMeeting({ role: 'accountant', ownerId: 7, meeting: meeting(7) })).toBe(false)
  })
})
