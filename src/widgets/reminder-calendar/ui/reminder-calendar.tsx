import { useMemo, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
  pluralReminders,
  ReminderCountBadge,
  type RemindersByDay,
} from '@/entities/reminder'
import { toDayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { MonthCalendarGrid, MonthYearNavigator } from '@/shared/ui/month-calendar'

interface ReminderCalendarProps {
  visibleMonth: Date
  selectedDate: Date | null
  today: Date
  remindersByDay: RemindersByDay
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
  totalThisMonth: number
  /** Слот слева в тулбаре (переключатель Встречи/Напоминания) */
  leading?: ReactNode
  isLoading?: boolean
  isFetching?: boolean
}

function countsFromRemindersByDay(remindersByDay: RemindersByDay): Map<string, number> {
  const counts = new Map<string, number>()
  for (const [key, reminders] of remindersByDay) {
    counts.set(key, reminders.length)
  }
  return counts
}

export function ReminderCalendar({
  visibleMonth,
  selectedDate,
  today,
  remindersByDay,
  onChangeMonth,
  onSelectDate,
  totalThisMonth,
  leading,
  isLoading = false,
  isFetching = false,
}: ReminderCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDate ? [toDayKey(selectedDate)] : []),
    [selectedDate],
  )

  return (
    <div className="@container/calendar flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:items-center @min-[880px]/calendar:justify-between @min-[880px]/calendar:gap-2.5">
        {leading ? <div className="min-w-0">{leading}</div> : null}
        <div className="flex min-w-0 items-center gap-2.5 @min-[880px]/calendar:justify-end">
          <Loader2
            aria-hidden={!isFetching}
            aria-label={isFetching ? 'Загрузка напоминаний' : undefined}
            className={cn(
              'hidden size-4 shrink-0 text-[#ACACAC] transition-opacity @min-[880px]/calendar:block',
              isFetching ? 'animate-spin opacity-100' : 'opacity-0',
            )}
          />
          <MonthYearNavigator
            visibleMonth={visibleMonth}
            onChangeMonth={onChangeMonth}
            compactBreakpoint="880px"
            grouped={false}
          />
        </div>
      </div>

      <div>
        <MonthCalendarGrid
          visibleMonth={visibleMonth}
          selectedKeys={selectedKeys}
          today={today}
          countsByDay={countsFromRemindersByDay(remindersByDay)}
          onToggleDate={onSelectDate}
          renderBadge={(count) => <ReminderCountBadge count={count} />}
          isLoading={isLoading}
          enablePaintSelect={false}
        />
        <p className="pt-2 text-right text-xs text-[#ACACAC] sm:pt-4 sm:text-sm">
          {totalThisMonth} {pluralReminders(totalThisMonth)} в этом месяце
        </p>
      </div>
    </div>
  )
}
