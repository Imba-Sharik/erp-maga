import { useMemo, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { MeetingCountBadge, pluralMeetings, type MeetingsByDay } from '@/entities/meeting'
import { toDayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import type { SelectOption } from '@/shared/ui/clearable-select'
import { MultiSelect } from '@/shared/ui/multi-select'
import { MonthCalendarGrid, MonthYearNavigator } from '@/shared/ui/month-calendar'

const SELECT_BASE =
  'max-md:h-9! md:h-10! min-w-0 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

interface MeetingCalendarProps {
  visibleMonth: Date
  selectedDate: Date | null
  today: Date
  meetingsByDay: MeetingsByDay
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
  showManagerFilter?: boolean
  /** Выбранные id менеджеров. Пустой массив — все менеджеры. */
  magManagerIds?: string[]
  onChangeMagManagerIds?: (values: string[]) => void
  managerFilterOptions?: readonly SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  totalThisMonth: number
  /** Слот слева в тулбаре (переключатель Встречи/Напоминания) */
  leading?: ReactNode
  isLoading?: boolean
  isFetching?: boolean
}

function countsFromMeetingsByDay(meetingsByDay: MeetingsByDay): Map<string, number> {
  const counts = new Map<string, number>()
  for (const [key, meetings] of meetingsByDay) {
    counts.set(key, meetings.length)
  }
  return counts
}

export function MeetingCalendar({
  visibleMonth,
  selectedDate,
  today,
  meetingsByDay,
  onChangeMonth,
  onSelectDate,
  showManagerFilter = false,
  magManagerIds = [],
  onChangeMagManagerIds,
  managerFilterOptions = [],
  managersSelectLoading = false,
  managersSelectError = false,
  totalThisMonth,
  leading,
  isLoading = false,
  isFetching = false,
}: MeetingCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDate ? [toDayKey(selectedDate)] : []),
    [selectedDate],
  )

  const managerSelectDisabled = managersSelectLoading || managersSelectError

  return (
    <div className="@container/calendar flex min-w-0 flex-col gap-4 overflow-x-hidden">
      {/* Один ряд (как в календаре проектов): селект менеджера слева, год/месяц справа. */}
      <div className="flex min-w-0 flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:items-center @min-[880px]/calendar:gap-2.5">
        {leading ? <div className="min-w-0">{leading}</div> : null}

        {showManagerFilter && onChangeMagManagerIds ? (
          <div className="w-full min-w-0 @min-[880px]/calendar:max-w-[320px] @min-[880px]/calendar:flex-1">
            <MultiSelect
              placeholder="Отв. менеджер"
              values={magManagerIds}
              options={managerFilterOptions}
              onChange={onChangeMagManagerIds}
              triggerClassName={SELECT_BASE}
              disabled={managerSelectDisabled}
            />
          </div>
        ) : null}

        <div className="flex min-w-0 items-center gap-2.5 @min-[880px]/calendar:ml-auto @min-[880px]/calendar:justify-end">
          <Loader2
            aria-hidden={!isFetching}
            aria-label={isFetching ? 'Загрузка встреч' : undefined}
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
          countsByDay={countsFromMeetingsByDay(meetingsByDay)}
          onToggleDate={onSelectDate}
          renderBadge={(count) => <MeetingCountBadge count={count} />}
          isLoading={isLoading}
          enablePaintSelect={false}
        />
        <p className="pt-2 text-right text-xs text-[#ACACAC] sm:pt-4 sm:text-sm">
          {totalThisMonth} {pluralMeetings(totalThisMonth)} в этом месяце
        </p>
      </div>
    </div>
  )
}
