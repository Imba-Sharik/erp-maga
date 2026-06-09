import { Loader2 } from 'lucide-react'
import { useLoftHallFilter, VenueFilterSelect } from '@/entities/venue'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib/utils'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'
import { SearchBar } from '@/shared/ui/search-bar'
import { MonthYearNavigator } from '@/widgets/month-calendar'

const SELECT_BASE =
  'max-md:h-9! md:h-10! min-w-0 w-full rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

/** С фильтром менеджера горизонтальный ряд не помещается при открытом сайдбаре и двухколоночной сетке. */
const TOOLBAR_LAYOUT = {
  default: {
    triggerBase: `${SELECT_BASE} @min-[880px]/calendar:w-fit @min-[880px]/calendar:min-w-32 @min-[880px]/calendar:flex-none`,
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[880px]/calendar:flex-row @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:items-center @min-[880px]/calendar:gap-2.5',
    searchRow:
      'flex w-full min-w-0 items-center gap-2 @min-[880px]/calendar:max-w-[300px] @min-[880px]/calendar:flex-1 @min-[880px]/calendar:basis-[240px]',
    filtersRow:
      'grid min-w-0 w-full grid-cols-2 gap-2.5 @min-[880px]/calendar:flex @min-[880px]/calendar:flex-1 @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:justify-end @min-[880px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[880px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[880px]/calendar:block',
    compactBreakpoint: '880px' as const,
  },
  withManagerFilter: {
    triggerBase: `${SELECT_BASE} @min-[1040px]/calendar:w-fit @min-[1040px]/calendar:min-w-32 @min-[1040px]/calendar:flex-none`,
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[1040px]/calendar:flex-row @min-[1040px]/calendar:flex-wrap @min-[1040px]/calendar:items-center @min-[1040px]/calendar:gap-2.5',
    searchRow:
      'flex w-full min-w-0 items-center gap-2 @min-[1040px]/calendar:max-w-[300px] @min-[1040px]/calendar:flex-1 @min-[1040px]/calendar:basis-[240px]',
    filtersRow:
      'grid min-w-0 w-full grid-cols-2 gap-2.5 @min-[1040px]/calendar:flex @min-[1040px]/calendar:flex-1 @min-[1040px]/calendar:flex-wrap @min-[1040px]/calendar:justify-end @min-[1040px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[1040px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[1040px]/calendar:block',
    compactBreakpoint: '1040px' as const,
  },
} as const

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
  const { loftOptions, hallOptions, selectDisabled, shouldResetHall } = useLoftHallFilter(loft)
  const handleChangeLoft = (next: string | null) => {
    onChangeLoft(next)
    if (shouldResetHall(next, hall)) onChangeHall(null)
  }
  const managerSelectDisabled = managersSelectLoading || managersSelectError
  const managerPlaceholder = isMobile ? 'Менеджер' : 'Отв. менеджер'

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
          onChange={handleChangeLoft}
          triggerClassName={layout.triggerBase}
          disabled={selectDisabled}
        />

        <MonthYearNavigator
          visibleMonth={visibleMonth}
          onChangeMonth={onChangeMonth}
          compactBreakpoint={layout.compactBreakpoint}
          grouped={false}
        />
      </div>
    </div>
  )
}
