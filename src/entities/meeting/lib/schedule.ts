import { countItemsInMonth, groupByDay, toDayKey } from '@/shared/lib/date'

import type { Meeting, MeetingsByDay } from '../model/types'

export function groupMeetingsByDay(meetings: Meeting[]): MeetingsByDay {
  return groupByDay(meetings, (meeting) => meeting.date)
}

export function countMeetingsInMonth(meetingsByDay: MeetingsByDay, month: Date): number {
  return countItemsInMonth(meetingsByDay, month)
}

export function getMeetingsForDate(meetingsByDay: MeetingsByDay, date: Date): Meeting[] {
  return meetingsByDay.get(toDayKey(date)) ?? []
}
