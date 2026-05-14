import { addMonths, getMonth, getYear, setMonth, setYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { SearchBar } from '@/shared/ui/search-bar'

const MONTHS_RU = [
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
]

const LOFT_OPTIONS = ['LOFT#1', 'LOFT#2', 'LOFT#3']
const HALL_OPTIONS = ['MAIN', 'BACKYARD', 'ROOFTOP']
const YEAR_OPTIONS = [2024, 2025, 2026, 2027]

const SELECT_TRIGGER_BASE =
  'h-10 min-w-32 flex-1 rounded-[10px] border-[#B1B1B1] bg-white ' +
  'data-placeholder:text-[#BCBCBC] ' +
  '@min-[880px]/calendar:flex-none'

const SELECT_TRIGGER_YEAR =
  'h-10 min-w-20 flex-1 rounded-[10px] border-[#B1B1B1] bg-white ' +
  'data-placeholder:text-[#BCBCBC] ' +
  '@min-[880px]/calendar:flex-none'

const MONTH_NAV_OUTER =
  'flex h-9 min-w-28 flex-1 items-center overflow-hidden rounded-[10px] border border-[#B1B1B1] bg-white ' +
  '@min-[880px]/calendar:flex-none'

const MONTH_NAV_ARROW_BTN =
  'flex h-full w-5 shrink-0 items-center justify-center text-[#3D3D3D] transition-colors ' +
  'hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset'

const MONTH_SELECT_TRIGGER =
  'h-full min-w-0 flex-1 justify-center gap-0 rounded-none border-0 bg-transparent px-1 py-0 shadow-none ' +
  'text-sm font-normal text-[#1B1A17] ' +
  'focus-visible:z-10 focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset ' +
  '[&>svg]:hidden ' +
  '[&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:justify-center'

interface CalendarToolbarProps {
  projectSearch: string
  onChangeProjectSearch: (value: string) => void
  visibleMonth: Date
  onChangeMonth: (date: Date) => void
  loft: string | null
  onChangeLoft: (loft: string | null) => void
  hall: string | null
  onChangeHall: (hall: string | null) => void
}

export function CalendarToolbar({
  projectSearch,
  onChangeProjectSearch,
  visibleMonth,
  onChangeMonth,
  loft,
  onChangeLoft,
  hall,
  onChangeHall,
}: CalendarToolbarProps) {
  const monthIndex = getMonth(visibleMonth)
  const year = getYear(visibleMonth)

  return (
    <div className="flex flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:items-center @min-[880px]/calendar:justify-between @min-[880px]/calendar:gap-2.5">
      <div className="w-full min-w-0 @min-[880px]/calendar:w-[min(100%,300px)] @min-[880px]/calendar:max-w-[300px] @min-[880px]/calendar:shrink-0">
        <SearchBar
          placeholder="Поиск проектов"
          value={projectSearch}
          onChange={(e) => onChangeProjectSearch(e.target.value)}
          groupClassName="w-full"
        />
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2.5 @min-[880px]/calendar:shrink-0 @min-[880px]/calendar:flex-nowrap">
        <ClearableSelect
          placeholder="Выберите зал"
          value={hall}
          options={HALL_OPTIONS}
          onChange={onChangeHall}
          triggerClassName={SELECT_TRIGGER_BASE}
        />
        <ClearableSelect
          placeholder="Выберите LOFT"
          value={loft}
          options={LOFT_OPTIONS}
          onChange={onChangeLoft}
          triggerClassName={SELECT_TRIGGER_BASE}
        />

        <Select
          value={String(year)}
          onValueChange={(v) => onChangeMonth(setYear(visibleMonth, Number(v)))}
        >
          <SelectTrigger className={SELECT_TRIGGER_YEAR}>
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

        <div className={MONTH_NAV_OUTER}>
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
      </div>
    </div>
  )
}
