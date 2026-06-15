import { useMemo, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { MeetingCountBadge, pluralMeetings, type MeetingsByDay } from '@/entities/meeting'
import { pluralReminders, ReminderCountBadge, type RemindersByDay } from '@/entities/reminder'
import { toDayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { MonthCalendarGrid, MonthYearNavigator } from '@/widgets/month-calendar'

interface CombinedCalendarProps {
  visibleMonth: Date
  selectedDate: Date | null
  today: Date
  meetingsByDay: MeetingsByDay
  remindersByDay: RemindersByDay
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
  /** Слот слева в тулбаре (переключатель режима) */
  leading?: ReactNode
  totalMeetings: number
  totalReminders: number
  isLoading?: boolean
  isFetching?: boolean
}

export function CombinedCalendar({
  visibleMonth,
  selectedDate,
  today,
  meetingsByDay,
  remindersByDay,
  onChangeMonth,
  onSelectDate,
  leading,
  totalMeetings,
  totalReminders,
  isLoading = false,
  isFetching = false,
}: CombinedCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDate ? [toDayKey(selectedDate)] : []),
    [selectedDate],
  )

  return (
    <div className="@container/calendar flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:items-center @min-[880px]/calendar:justify-between @min-[880px]/calendar:gap-2.5">
        {leading ? <div className="min-w-0">{leading}</div> : null}
        <div className="flex min-w-0 items-center gap-2.5 @min-[880px]/calendar:ml-auto @min-[880px]/calendar:justify-end">
          <Loader2
            aria-hidden={!isFetching}
            aria-label={isFetching ? 'Загрузка' : undefined}
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
          onToggleDate={onSelectDate}
          renderDayBadge={(dayKey) => {
            const meetings = meetingsByDay.get(dayKey)?.length ?? 0
            const reminders = remindersByDay.get(dayKey)?.length ?? 0
            if (!meetings && !reminders) return null
            return (
              // По умолчанию плашки столбиком; только на узких телефонах (≤375px)
              // ставим кружки в ряд без зазора, иначе второй кружок не влезает.
              <div className="flex min-w-0 flex-col items-start gap-1.5 max-[375px]:flex-row max-[375px]:flex-nowrap max-[375px]:items-center max-[375px]:gap-0">
                <MeetingCountBadge count={meetings} />
                <ReminderCountBadge count={reminders} />
              </div>
            )
          }}
          isLoading={isLoading}
          enablePaintSelect={false}
        />
        <p className="pt-2 text-right text-xs text-[#ACACAC] sm:pt-4 sm:text-sm">
          {totalMeetings} {pluralMeetings(totalMeetings)} · {totalReminders}{' '}
          {pluralReminders(totalReminders)} в этом месяце
        </p>
      </div>
    </div>
  )
}
