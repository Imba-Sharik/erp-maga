import { addMonths, getMonth, getYear, setMonth, setYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

export const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const

export const YEAR_OPTIONS = [2024, 2025, 2026, 2027] as const

const SELECT_BASE =
  'max-md:h-9! md:h-10! min-w-0 w-full rounded-[10px] border-border-strong bg-white data-placeholder:text-disabled-foreground'

const MONTH_NAV_ARROW_BTN =
  'flex h-full w-5 shrink-0 items-center justify-center text-foreground-soft transition-colors ' +
  'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset'

const MONTH_SELECT_TRIGGER =
  'h-full min-w-0 flex-1 justify-center gap-0 rounded-none border-0 bg-transparent px-1 py-0 shadow-none ' +
  'text-sm font-normal text-foreground ' +
  'focus-visible:z-10 focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset ' +
  '[&>svg]:hidden ' +
  '[&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:justify-center'

const LAYOUT = {
  compact: {
    triggerYear: `${SELECT_BASE} @min-[560px]/calendar:w-fit @min-[560px]/calendar:min-w-20 @min-[560px]/calendar:flex-none`,
    monthNav:
      'flex max-md:h-9! md:h-10! min-w-0 w-full items-center overflow-hidden rounded-[10px] border border-border-strong bg-white ' +
      '@min-[560px]/calendar:w-fit @min-[560px]/calendar:min-w-28 @min-[560px]/calendar:flex-none',
  },
  default: {
    triggerYear: `${SELECT_BASE} @min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-20 @min-[880px]/calendar:flex-none`,
    monthNav:
      'flex max-md:h-9! md:h-10! min-w-0 w-full items-center overflow-hidden rounded-[10px] border border-border-strong bg-white ' +
      '@min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-28 @min-[880px]/calendar:flex-none',
  },
  wide: {
    triggerYear: `${SELECT_BASE} @min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-20 @min-[1040px]/calendar:flex-none`,
    monthNav:
      'flex max-md:h-9! md:h-10! min-w-0 w-full items-center overflow-hidden rounded-[10px] border border-border-strong bg-white ' +
      '@min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-28 @min-[1040px]/calendar:flex-none',
  },
  wider: {
    triggerYear: `${SELECT_BASE} @min-[1200px]/calendar:w-fit @min-[1200px]/calendar:min-w-20 @min-[1200px]/calendar:flex-none`,
    monthNav:
      'flex max-md:h-9! md:h-10! min-w-0 w-full items-center overflow-hidden rounded-[10px] border border-border-strong bg-white ' +
      '@min-[1200px]/calendar:w-fit @min-[1200px]/calendar:min-w-28 @min-[1200px]/calendar:flex-none',
  },
} as const

interface MonthYearNavigatorProps {
  visibleMonth: Date
  onChangeMonth: (date: Date) => void
  compactBreakpoint?: '560px' | '880px' | '1040px' | '1200px'
  className?: string
  /**
   * В `filtersRow` календаря проектов год и месяц — отдельные ячейки grid (2 колонки на mobile).
   * `grouped={false}` возвращает их соседними siblings без обёртки.
   */
  grouped?: boolean
}

export function MonthYearNavigator({
  visibleMonth,
  onChangeMonth,
  compactBreakpoint = '880px',
  className,
  grouped = true,
}: MonthYearNavigatorProps) {
  const layout =
    compactBreakpoint === '1200px'
      ? LAYOUT.wider
      : compactBreakpoint === '1040px'
        ? LAYOUT.wide
        : compactBreakpoint === '560px'
          ? LAYOUT.compact
          : LAYOUT.default
  const monthIndex = getMonth(visibleMonth)
  const year = getYear(visibleMonth)

  const yearSelect = (
    <Select
      value={String(year)}
      onValueChange={(v) => onChangeMonth(setYear(visibleMonth, Number(v)))}
    >
      <SelectTrigger className={layout.triggerYear}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {YEAR_OPTIONS.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const monthNav = (
    <div className={layout.monthNav}>
      <button
        type="button"
        className={MONTH_NAV_ARROW_BTN}
        aria-label="Предыдущий месяц"
        onClick={() => onChangeMonth(addMonths(visibleMonth, -1))}
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>
      <Select
        value={String(monthIndex)}
        onValueChange={(v) => onChangeMonth(setMonth(visibleMonth, Number(v)))}
      >
        <SelectTrigger className={MONTH_SELECT_TRIGGER}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS_RU.map((name, i) => (
            <SelectItem key={name} value={String(i)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        className={MONTH_NAV_ARROW_BTN}
        aria-label="Следующий месяц"
        onClick={() => onChangeMonth(addMonths(visibleMonth, 1))}
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </button>
    </div>
  )

  if (!grouped) {
    return (
      <>
        {yearSelect}
        {monthNav}
      </>
    )
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      {yearSelect}
      {monthNav}
    </div>
  )
}
