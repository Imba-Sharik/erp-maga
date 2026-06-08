import { format } from 'date-fns'

import { toDayKey } from '@/shared/lib/date'

import type { Meeting, MeetingsByDay } from '../model/types'

export function groupMeetingsByDay(meetings: Meeting[]): MeetingsByDay {
  const map: MeetingsByDay = new Map()
  for (const meeting of meetings) {
    const list = map.get(meeting.date)
    if (list) list.push(meeting)
    else map.set(meeting.date, [meeting])
  }
  return map
}

export function countMeetingsInMonth(meetingsByDay: MeetingsByDay, month: Date): number {
  const prefix = `${format(month, 'yyyy-MM')}-`
  let total = 0
  for (const [key, meetings] of meetingsByDay) {
    if (key.startsWith(prefix)) total += meetings.length
  }
  return total
}

export function getMeetingsForDate(meetingsByDay: MeetingsByDay, date: Date): Meeting[] {
  return meetingsByDay.get(toDayKey(date)) ?? []
}
