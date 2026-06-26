import { Search } from 'lucide-react'
import { PlumEventStatusFilterSelect, ProjectsSortSelect } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { useLoftHallFilter, VenueFilterSelect } from '@/entities/venue'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const TRIGGER_CLASS =
  'h-10! w-full min-w-[calc(50%-4px)] flex-1 rounded-[10px] border-border-strong bg-card text-xs data-placeholder:text-disabled-foreground @4xl:w-41.5 @4xl:min-w-0 @4xl:flex-none @4xl:text-sm'

// Слот сортировки: на мобиле занимает половину ряда (как фильтры), на десктопе шире —
// внутри помимо селекта ещё стрелка направления и подписи длиннее («По дате мероприятия»).
const SORT_SLOT_CLASS = 'min-w-[calc(50%-4px)] flex-1 @4xl:min-w-0 @4xl:w-64 @4xl:flex-none'

interface ProjectsBoardToolbarProps {
  search: string
  sort: string
  city: string | null
  hall: string | null
  loft: string | null
  plumEventStatus: string[]
  onChangeSearch: (value: string) => void
  onChangeSort: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
  onChangePlumEventStatus: (values: string[]) => void
  onAddProject?: () => void
  /** Селекты рядом с поиском (слева), без растягивания вправо */
  filtersAlign?: 'start' | 'spread'
}

export function ProjectsBoardToolbar({
  search,
  sort,
  city,
  hall,
  loft,
  plumEventStatus,
  onChangeSearch,
  onChangeSort,
  onChangeCity,
  onChangeHall,
  onChangeLoft,
  onChangePlumEventStatus,
  onAddProject,
  filtersAlign = 'spread',
}: ProjectsBoardToolbarProps) {
  const role = useUserRole()
  const isManagerRole = role === 'manager'
  const {
    loftOptions,
    hallOptions: hallOptionsForLoft,
    cityOptions,
    showCityFilter,
    showLoftFilter,
    selectDisabled,
    shouldResetHall,
  } = useLoftHallFilter(loft, { assigned: isManagerRole })
  const filtersAtStart = filtersAlign === 'start'

  // Смена LOFT, при которой выбранный зал ему не принадлежит, — сбрасываем зал.
  const handleChangeLoft = (next: string | null) => {
    onChangeLoft(next)
    if (shouldResetHall(next, hall)) onChangeHall(null)
  }

  return (
    <div
      className={
        filtersAtStart
          ? 'flex min-w-0 shrink-0 flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-start @4xl:gap-4'
          : 'flex min-w-0 shrink-0 flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-between @4xl:gap-4'
      }
    >
      <div className="flex items-center gap-2 @4xl:w-75">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2 @4xl:left-3 @4xl:size-4" />
          <Input
            type="search"
            placeholder="Поиск проектов"
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="border-border-strong placeholder:text-muted-foreground bg-card h-10 rounded-[10px] pr-1.5 pl-7 text-xs placeholder:text-xs @4xl:pr-3 @4xl:pl-9 @4xl:text-sm @4xl:placeholder:text-sm"
          />
        </div>
        {onAddProject && (
          <Button
            type="button"
            onClick={onAddProject}
            aria-label="Добавить проект"
            className="bg-primary text-primary-foreground hover:bg-primary/90 size-10 shrink-0 rounded-[10px] p-0 text-lg leading-none @4xl:hidden"
          >
            +
          </Button>
        )}
      </div>

      <div
        className={
          filtersAtStart
            ? 'flex min-w-0 flex-wrap items-center gap-2 @4xl:gap-2.5'
            : 'flex min-w-0 flex-1 flex-wrap items-center gap-2 @4xl:flex-none @4xl:gap-2.5'
        }
      >
        <ProjectsSortSelect value={sort} onChange={onChangeSort} className={SORT_SLOT_CLASS} />
        {showCityFilter ? (
          <VenueFilterSelect
            filter="city"
            value={city}
            options={cityOptions}
            onChange={onChangeCity}
            triggerClassName={TRIGGER_CLASS}
          />
        ) : null}
        <VenueFilterSelect
          filter="hall"
          value={hall}
          options={hallOptionsForLoft}
          onChange={onChangeHall}
          triggerClassName={TRIGGER_CLASS}
          disabled={selectDisabled}
        />
        {showLoftFilter ? (
          <VenueFilterSelect
            filter="loft"
            value={loft}
            options={loftOptions}
            onChange={handleChangeLoft}
            triggerClassName={TRIGGER_CLASS}
            disabled={selectDisabled}
          />
        ) : null}
        <PlumEventStatusFilterSelect
          values={plumEventStatus}
          onChange={onChangePlumEventStatus}
          triggerClassName={TRIGGER_CLASS}
        />
      </div>
    </div>
  )
}
