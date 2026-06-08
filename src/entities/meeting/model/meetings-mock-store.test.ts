import { beforeEach, describe, expect, it } from 'vitest'

import {
  createMeeting,
  deleteMeeting,
  listMeetings,
  resetMeetingsMockStore,
  updateMeeting,
} from './meetings-mock-store'

describe('meetings-mock-store', () => {
  beforeEach(() => {
    resetMeetingsMockStore()
  })

  it('фильтрует встречи по менеджеру и диапазону дат', async () => {
    const all = await listMeetings({
      dateFrom: '2000-01-01',
      dateTo: '2099-12-31',
      managerId: 1,
    })
    expect(all.length).toBeGreaterThanOrEqual(5)
    expect(all.every((m) => m.managerId === 1)).toBe(true)

    const empty = await listMeetings({
      dateFrom: '2000-01-01',
      dateTo: '2000-01-02',
      managerId: 1,
    })
    expect(empty).toHaveLength(0)
  })

  it('без managerId возвращает встречи всех менеджеров', async () => {
    const all = await listMeetings({
      dateFrom: '2000-01-01',
      dateTo: '2099-12-31',
      managerId: null,
    })
    expect(all.length).toBeGreaterThanOrEqual(25)
    expect(new Set(all.map((m) => m.managerId)).size).toBeGreaterThanOrEqual(3)
  })

  it('создаёт, обновляет и удаляет встречу', async () => {
    const created = await createMeeting({
      title: 'Новая',
      comment: 'Тест',
      time: '09:00',
      date: '2026-06-10',
      managerId: 99,
    })
    expect(created.id).toBeTruthy()

    const updated = await updateMeeting(created.id, {
      title: 'Обновлённая',
      comment: 'Новый комментарий',
      time: '11:00',
    })
    expect(updated.title).toBe('Обновлённая')

    await deleteMeeting(created.id)
    const list = await listMeetings({
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
      managerId: 99,
    })
    expect(list).toHaveLength(0)
  })
})
