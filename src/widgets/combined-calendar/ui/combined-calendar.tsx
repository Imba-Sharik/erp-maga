import { useMemo, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { MeetingCountBadge, pluralMeetings, type MeetingsByDay } from '@/entities/meeting'
import { pluralReminders, ReminderCountBadge, type RemindersByDay } from '@/entities/reminder'
import { toDayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import type { SelectOption } from '@/shared/ui/clearable-select'
import { MultiSelect } from '@/shared/ui/multi-select'
import { MonthCalendarGrid, MonthYearNavigator } from '@/shared/ui/month-calendar'

const SELECT_BASE =
  'max-md:h-9! md:h-10! min-w-0 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

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
  /** Мульти-фильтр по менеджерам (Руководитель/админ). Пустой выбор — все менеджеры. */
  showManagerFilter?: boolean
  magManagerIds?: string[]
  onChangeMagManagerIds?: (values: string[]) => void
  managerFilterOptions?: readonly SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
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
  showManagerFilter = false,
  magManagerIds = [],
  onChangeMagManagerIds,
  managerFilterOptions = [],
  managersSelectLoading = false,
  managersSelectError = false,
  totalMeetings,
  totalReminders,
  isLoading = false,
  isFetching = false,
}: CombinedCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDate ? [toDayKey(selectedDate)] : []),
    [selectedDate],
  )

  const managerSelectDisabled = managersSelectLoading || managersSelectError

  return (
    <div className="@container/calendar flex min-w-0 flex-col gap-4 overflow-x-hidden">
      {/* Один ряд: слот/селект менеджера слева, год/месяц справа (порог 560px). */}
      <div className="flex min-w-0 flex-col gap-3 @min-[560px]/calendar:flex-row @min-[560px]/calendar:flex-wrap @min-[560px]/calendar:items-center @min-[560px]/calendar:gap-2.5">
        {leading ? <div className="min-w-0">{leading}</div> : null}

        {showManagerFilter && onChangeMagManagerIds ? (
          <div className="w-full min-w-0 @min-[560px]/calendar:max-w-[320px] @min-[560px]/calendar:flex-1">
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

        <div className="flex min-w-0 items-center gap-2.5 @min-[560px]/calendar:ml-auto @min-[560px]/calendar:justify-end">
          <Loader2
            aria-hidden={!isFetching}
            aria-label={isFetching ? 'Загрузка' : undefined}
            className={cn(
              'hidden size-4 shrink-0 text-[#ACACAC] transition-opacity @min-[560px]/calendar:block',
              isFetching ? 'animate-spin opacity-100' : 'opacity-0',
            )}
          />
          <MonthYearNavigator
            visibleMonth={visibleMonth}
            onChangeMonth={onChangeMonth}
            compactBreakpoint="560px"
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
              // Кружки (контейнер <700px) — в ряд без переноса. До 375px вплотную
              // (чтобы оба влезли), с 375px — зазор между ними.
              // Текстовые плашки (≥700px) — столбиком.
              <div className="flex min-w-0 flex-row flex-nowrap items-center gap-0 min-[375px]:gap-1.5 @min-[700px]/calendar:flex-col @min-[700px]/calendar:items-start @min-[700px]/calendar:gap-1.5">
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
