import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { MeetingCountBadge, pluralMeetings, type MeetingsByDay } from '@/entities/meeting'
import { toDayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'
import { MonthCalendarGrid, MonthYearNavigator } from '@/widgets/month-calendar'

const SELECT_BASE =
  'max-md:h-9! md:h-10! min-w-0 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

const TOOLBAR_LAYOUT = {
  default: {
    triggerBase: `${SELECT_BASE} @min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-32 @min-[880px]/calendar:flex-none`,
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:items-center @min-[880px]/calendar:gap-2.5',
    topRow:
      'flex w-full min-w-0 items-center gap-2 @min-[880px]/calendar:max-w-[300px] @min-[880px]/calendar:flex-1 @min-[880px]/calendar:basis-[240px]',
    filtersRow:
      'grid min-w-0 w-full grid-cols-2 gap-2.5 @min-[880px]/calendar:flex @min-[880px]/calendar:flex-1 @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:justify-end @min-[880px]/calendar:gap-2.5 @min-[880px]/calendar:basis-[280px]',
    compactBreakpoint: '880px' as const,
  },
  withManagerFilter: {
    triggerBase: `${SELECT_BASE} @min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-32 @min-[1040px]/calendar:flex-none`,
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[1040px]/calendar:flex-row @min-[1040px]/calendar:flex-wrap @min-[1040px]/calendar:items-center @min-[1040px]/calendar:gap-2.5',
    topRow:
      'flex w-full min-w-0 items-center gap-2 @min-[1040px]/calendar:max-w-[300px] @min-[1040px]/calendar:flex-1 @min-[1040px]/calendar:basis-[240px]',
    filtersRow:
      'grid min-w-0 w-full grid-cols-2 gap-2.5 @min-[1040px]/calendar:flex @min-[1040px]/calendar:flex-1 @min-[1040px]/calendar:flex-wrap @min-[1040px]/calendar:justify-end @min-[1040px]/calendar:gap-2.5 @min-[1040px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[1040px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[1040px]/calendar:block',
    compactBreakpoint: '1040px' as const,
  },
} as const

interface MeetingCalendarProps {
  visibleMonth: Date
  selectedDate: Date | null
  today: Date
  meetingsByDay: MeetingsByDay
  onChangeMonth: (date: Date) => void
  onSelectDate: (date: Date) => void
  showManagerFilter?: boolean
  magManagerId?: string | null
  onChangeMagManager?: (value: string | null) => void
  managerFilterOptions?: readonly SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  totalThisMonth: number
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

function MeetingManagerFilterSelect({
  value,
  onChange,
  options,
  disabled,
  triggerClassName,
  className,
}: {
  value: string | null
  onChange: (value: string | null) => void
  options: readonly SelectOption[]
  disabled?: boolean
  triggerClassName: string
  className?: string
}) {
  return (
    <div className={className}>
      <ClearableSelect
        placeholder="Отв. менеджер"
        value={value}
        options={options}
        onChange={onChange}
        triggerClassName={triggerClassName}
        disabled={disabled}
      />
    </div>
  )
}

export function MeetingCalendar({
  visibleMonth,
  selectedDate,
  today,
  meetingsByDay,
  onChangeMonth,
  onSelectDate,
  showManagerFilter = false,
  magManagerId = null,
  onChangeMagManager,
  managerFilterOptions = [],
  managersSelectLoading = false,
  managersSelectError = false,
  totalThisMonth,
  isLoading = false,
  isFetching = false,
}: MeetingCalendarProps) {
  const selectedKeys = useMemo<ReadonlySet<string>>(
    () => new Set(selectedDate ? [toDayKey(selectedDate)] : []),
    [selectedDate],
  )

  const layout = showManagerFilter ? TOOLBAR_LAYOUT.withManagerFilter : TOOLBAR_LAYOUT.default
  const managerSelectDisabled = managersSelectLoading || managersSelectError

  const loaderBreakpoint =
    layout.compactBreakpoint === '1040px'
      ? '@min-[1040px]/calendar:block'
      : '@min-[880px]/calendar:block'

  const managerFilterMobile =
    showManagerFilter && onChangeMagManager ? (
      <MeetingManagerFilterSelect
        value={magManagerId}
        onChange={onChangeMagManager}
        options={managerFilterOptions}
        disabled={managerSelectDisabled}
        triggerClassName={layout.triggerBase}
        className={cn(
          'w-full min-w-0',
          'managerMobileHide' in layout ? layout.managerMobileHide : undefined,
        )}
      />
    ) : null

  return (
    <div className="@container/calendar flex min-w-0 flex-col gap-4 overflow-x-hidden">
      <div className={layout.toolbar}>
        {showManagerFilter && onChangeMagManager ? (
          <div className={layout.topRow}>
            {managerFilterMobile}
            <Loader2
              aria-hidden={!isFetching}
              aria-label={isFetching ? 'Загрузка встреч' : undefined}
              className={cn(
                'hidden size-4 shrink-0 text-[#ACACAC] transition-opacity',
                loaderBreakpoint,
                isFetching ? 'animate-spin opacity-100' : 'opacity-0',
              )}
            />
          </div>
        ) : null}

        <div className={layout.filtersRow}>
          {showManagerFilter && onChangeMagManager ? (
            <MeetingManagerFilterSelect
              value={magManagerId}
              onChange={onChangeMagManager}
              options={managerFilterOptions}
              disabled={managerSelectDisabled}
              triggerClassName={layout.triggerBase}
              className={'managerDesktopShow' in layout ? layout.managerDesktopShow : undefined}
            />
          ) : null}
          <MonthYearNavigator
            visibleMonth={visibleMonth}
            onChangeMonth={onChangeMonth}
            compactBreakpoint={layout.compactBreakpoint}
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
