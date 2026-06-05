import { addMonths, getMonth, getYear, setMonth, setYear } from 'date-fns'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useVenueCatalog, VenueFilterSelect } from '@/entities/venue'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib/utils'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'
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

const YEAR_OPTIONS = [2024, 2025, 2026, 2027]

const SELECT_BASE =
  'max-md:h-9! md:h-10! min-w-0 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

/** С фильтром менеджера горизонтальный ряд не помещается при открытом сайдбаре и двухколоночной сетке. */
const TOOLBAR_LAYOUT = {
  default: {
    triggerBase: `${SELECT_BASE} @min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-32 @min-[880px]/calendar:flex-none`,
    triggerYear: `${SELECT_BASE} @min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-20 @min-[880px]/calendar:flex-none`,
    monthNav:
      'flex max-md:h-9! md:h-10! min-w-0 w-full items-center overflow-hidden rounded-[10px] border border-[#B1B1B1] bg-white ' +
      '@min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-28 @min-[880px]/calendar:flex-none',
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:items-center @min-[880px]/calendar:gap-2.5',
    searchRow:
      'flex w-full min-w-0 items-center gap-2 @min-[880px]/calendar:max-w-[300px] @min-[880px]/calendar:flex-1 @min-[880px]/calendar:basis-[240px]',
    filtersRow:
      'grid min-w-0 w-full grid-cols-2 gap-2.5 @min-[880px]/calendar:flex @min-[880px]/calendar:flex-1 @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:justify-end @min-[880px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[880px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[880px]/calendar:block',
  },
  withManagerFilter: {
    triggerBase: `${SELECT_BASE} @min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-32 @min-[1040px]/calendar:flex-none`,
    triggerYear: `${SELECT_BASE} @min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-20 @min-[1040px]/calendar:flex-none`,
    monthNav:
      'flex max-md:h-9! md:h-10! min-w-0 w-full items-center overflow-hidden rounded-[10px] border border-[#B1B1B1] bg-white ' +
      '@min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-28 @min-[1040px]/calendar:flex-none',
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[1040px]/calendar:flex-row @min-[1040px]/calendar:flex-wrap @min-[1040px]/calendar:items-center @min-[1040px]/calendar:gap-2.5',
    searchRow:
      'flex w-full min-w-0 items-center gap-2 @min-[1040px]/calendar:max-w-[300px] @min-[1040px]/calendar:flex-1 @min-[1040px]/calendar:basis-[240px]',
    filtersRow:
      'grid min-w-0 w-full grid-cols-2 gap-2.5 @min-[1040px]/calendar:flex @min-[1040px]/calendar:flex-1 @min-[1040px]/calendar:flex-wrap @min-[1040px]/calendar:justify-end @min-[1040px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[1040px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[1040px]/calendar:block',
  },
} as const

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
  showManagerFilter?: boolean
  magManagerId?: string | null
  onChangeMagManager?: (value: string | null) => void
  managerFilterOptions?: readonly SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  isFetching?: boolean
}

function CalendarManagerFilterSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  triggerClassName,
  className,
}: {
  value: string | null
  onChange: (value: string | null) => void
  options: readonly SelectOption[]
  placeholder: string
  disabled?: boolean
  triggerClassName: string
  className?: string
}) {
  return (
    <div className={className}>
      <ClearableSelect
        placeholder={placeholder}
        value={value}
        options={options}
        onChange={onChange}
        triggerClassName={triggerClassName}
        disabled={disabled}
      />
    </div>
  )
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
  showManagerFilter = false,
  magManagerId = null,
  onChangeMagManager,
  managerFilterOptions = [],
  managersSelectLoading = false,
  managersSelectError = false,
  isFetching = false,
}: CalendarToolbarProps) {
  const layout = showManagerFilter ? TOOLBAR_LAYOUT.withManagerFilter : TOOLBAR_LAYOUT.default
  const isMobile = useIsMobile()
  const { hallOptions, loftOptions, isLoading, isError } = useVenueCatalog()
  const selectDisabled = isLoading || isError
  const managerSelectDisabled = managersSelectLoading || managersSelectError
  const managerPlaceholder = isMobile ? 'Менеджер' : 'Отв. менеджер'
  const monthIndex = getMonth(visibleMonth)
  const year = getYear(visibleMonth)

  const managerFilter =
    showManagerFilter && onChangeMagManager ? (
      <CalendarManagerFilterSelect
        value={magManagerId}
        onChange={onChangeMagManager}
        options={managerFilterOptions}
        placeholder={managerPlaceholder}
        disabled={managerSelectDisabled}
        triggerClassName={layout.triggerBase}
        className={cn('w-[min(40%,160px)] shrink-0', layout.managerMobileHide)}
      />
    ) : null

  return (
    <div className={layout.toolbar}>
      <div className={layout.searchRow}>
        <SearchBar
          placeholder="Поиск проектов"
          value={projectSearch}
          onChange={(e) => onChangeProjectSearch(e.target.value)}
          groupClassName={cn(
            'min-w-0 max-md:h-9! md:h-10',
            showManagerFilter ? 'flex-1' : 'w-full',
          )}
        />
        {managerFilter}
        <Loader2
          aria-hidden={!isFetching}
          aria-label={isFetching ? 'Загрузка проектов' : undefined}
          className={cn(
            'hidden size-4 shrink-0 text-[#ACACAC] transition-opacity xl:block',
            isFetching ? 'animate-spin opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <div className={layout.filtersRow}>
        {showManagerFilter && onChangeMagManager ? (
          <CalendarManagerFilterSelect
            value={magManagerId}
            onChange={onChangeMagManager}
            options={managerFilterOptions}
            placeholder={managerPlaceholder}
            disabled={managerSelectDisabled}
            triggerClassName={layout.triggerBase}
            className={layout.managerDesktopShow}
          />
        ) : null}
        <VenueFilterSelect
          filter="hall"
          value={hall}
          options={hallOptions}
          onChange={onChangeHall}
          triggerClassName={layout.triggerBase}
          disabled={selectDisabled}
        />
        <VenueFilterSelect
          filter="loft"
          value={loft}
          options={loftOptions}
          onChange={onChangeLoft}
          triggerClassName={layout.triggerBase}
          disabled={selectDisabled}
        />

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
      </div>
    </div>
  )
}
