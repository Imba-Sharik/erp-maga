// import { Loader2 } from 'lucide-react'
import { PlumEventStatusFilterSelect } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { useLoftHallFilter, VenueFilterMultiSelect, VenueFilterSelect } from '@/entities/venue'
import { useIsMobile } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'
import { SearchBar } from '@/shared/ui/search-bar'
import { MonthYearNavigator } from '@/shared/ui/month-calendar'

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
    // Стек-режим (<880px): фильтры авто-упаковываются по ширине, а не жёстко по 2 в ряд.
    filtersRow:
      'grid min-w-0 w-full grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 @min-[880px]/calendar:flex @min-[880px]/calendar:flex-1 @min-[880px]/calendar:flex-wrap @min-[880px]/calendar:justify-end @min-[880px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[880px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[880px]/calendar:block',
    compactBreakpoint: '880px' as const,
  },
  withManagerFilter: {
    triggerBase: `${SELECT_BASE} @min-[1200px]/calendar:w-fit @min-[1200px]/calendar:min-w-32 @min-[1200px]/calendar:flex-none`,
    toolbar:
      'flex min-w-0 w-full flex-col gap-3 @min-[1200px]/calendar:flex-row @min-[1200px]/calendar:flex-wrap @min-[1200px]/calendar:items-center @min-[1200px]/calendar:gap-2.5',
    searchRow:
      'flex w-full min-w-0 items-center gap-2 @min-[1200px]/calendar:max-w-[300px] @min-[1200px]/calendar:flex-1 @min-[1200px]/calendar:basis-[240px]',
    // Стек-режим (<1200px): фильтры авто-упаковываются по ширине, а не жёстко по 2 в ряд
    // (у Руководителя зал/LOFT/статус/год/месяц укладываются в одну строку вместо четырёх).
    // Side-by-side с поиском включаем только с 1200px — раньше 6 контролов не влезали
    // в один ряд, навигатор месяца переносился, а поиск зависал по центру (ERP-193).
    filtersRow:
      'grid min-w-0 w-full grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 @min-[1200px]/calendar:flex @min-[1200px]/calendar:flex-1 @min-[1200px]/calendar:flex-wrap @min-[1200px]/calendar:justify-end @min-[1200px]/calendar:basis-[520px]',
    managerMobileHide: '@min-[1200px]/calendar:hidden',
    managerDesktopShow: 'hidden @min-[1200px]/calendar:block',
    compactBreakpoint: '1200px' as const,
  },
} as const

interface CalendarToolbarProps {
  projectSearch: string
  onChangeProjectSearch: (value: string) => void
  visibleMonth: Date
  onChangeMonth: (date: Date) => void
  loft: string | null
  onChangeLoft: (loft: string | null) => void
  hall: string[]
  onChangeHall: (hall: string[]) => void
  showManagerFilter?: boolean
  magManagerId?: string | null
  onChangeMagManager?: (value: string | null) => void
  managerFilterOptions?: readonly SelectOption[]
  managersSelectLoading?: boolean
  managersSelectError?: boolean
  restrictToHallIds?: readonly number[] | undefined
  venueSelectDisabled?: boolean
  plumEventStatus: string[]
  onChangePlumEventStatus: (values: string[]) => void
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
  restrictToHallIds,
  venueSelectDisabled = false,
  plumEventStatus,
  onChangePlumEventStatus,
}: CalendarToolbarProps) {
  const layout = showManagerFilter ? TOOLBAR_LAYOUT.withManagerFilter : TOOLBAR_LAYOUT.default
  const isMobile = useIsMobile()
  const role = useUserRole()
  const isManagerRole = role === 'manager'
  const {
    loftOptions,
    hallOptions,
    showLoftFilter,
    selectDisabled: catalogDisabled,
    shouldResetHall,
  } = useLoftHallFilter(loft, { assigned: isManagerRole, restrictToHallIds })
  const selectDisabled = catalogDisabled || venueSelectDisabled
  const handleChangeLoft = (next: string | null) => {
    onChangeLoft(next)
    if (next) onChangeHall(hall.filter((h) => !shouldResetHall(next, h)))
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
        {/* <Loader2
          aria-hidden={!isFetching}
          aria-label={isFetching ? 'Загрузка проектов' : undefined}
          className={cn(
            'hidden size-4 shrink-0 text-[#ACACAC] transition-opacity xl:block',
            isFetching ? 'animate-spin opacity-100' : 'opacity-0',
          )}
        /> */}
        {managerFilter}
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
        <VenueFilterMultiSelect
          filter="hall"
          values={hall}
          options={hallOptions}
          onChange={onChangeHall}
          triggerClassName={layout.triggerBase}
          disabled={selectDisabled}
        />
        {showLoftFilter ? (
          <VenueFilterSelect
            filter="loft"
            value={loft}
            options={loftOptions}
            onChange={handleChangeLoft}
            triggerClassName={layout.triggerBase}
            disabled={selectDisabled}
          />
        ) : null}
        <PlumEventStatusFilterSelect
          values={plumEventStatus}
          onChange={onChangePlumEventStatus}
          triggerClassName={layout.triggerBase}
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
