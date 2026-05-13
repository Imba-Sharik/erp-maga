import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export interface MonthDay {
  date: Date
  key: string
  dayNum: number
  outOfMonth: boolean
  isToday: (today: Date) => boolean
  isSelected: (selected: Date) => boolean
}

export function buildMonthMatrix(month: Date): MonthDay[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    key: format(date, 'yyyy-MM-dd'),
    dayNum: date.getDate(),
    outOfMonth: !isSameMonth(date, month),
    isToday: (today) => isSameDay(date, today),
    isSelected: (selected) => isSameDay(date, selected),
  }))
}

export const WEEKDAYS_RU = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const
