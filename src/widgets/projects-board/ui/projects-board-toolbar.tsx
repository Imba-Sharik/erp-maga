import { Search } from 'lucide-react'
import { useVenueCatalog, VenueFilterSelect } from '@/entities/venue'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const CITY_OPTIONS = ['Москва', 'Санкт-Петербург', 'Казань']

const TRIGGER_CLASS =
  'h-10! w-full min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white text-xs data-placeholder:text-[#BCBCBC] @3xl:w-41.5 @3xl:flex-none @3xl:text-sm'

interface ProjectsBoardToolbarProps {
  search: string
  city: string | null
  hall: string | null
  loft: string | null
  onChangeSearch: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
  onAddProject?: () => void
  /** Селекты рядом с поиском (слева), без растягивания вправо */
  filtersAlign?: 'start' | 'spread'
}

export function ProjectsBoardToolbar({
  search,
  city,
  hall,
  loft,
  onChangeSearch,
  onChangeCity,
  onChangeHall,
  onChangeLoft,
  onAddProject,
  filtersAlign = 'spread',
}: ProjectsBoardToolbarProps) {
  const { hallOptions, loftOptions, isLoading, isError } = useVenueCatalog()
  const selectDisabled = isLoading || isError
  const filtersAtStart = filtersAlign === 'start'

  return (
    <div
      className={
        filtersAtStart
          ? '@container flex shrink-0 flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-start @3xl:gap-4'
          : '@container flex shrink-0 flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-4'
      }
    >
      <div className="flex items-center gap-2 @3xl:w-75">
        {onAddProject && (
          <Button
            type="button"
            onClick={onAddProject}
            className="h-10 shrink-0 rounded-[10px] bg-black px-2 text-xs text-white hover:bg-black/90 @3xl:hidden"
          >
            Добавить проект
          </Button>
        )}
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-[#ACACAC] @3xl:left-3 @3xl:size-4" />
          <Input
            type="search"
            placeholder="Поиск проектов"
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-7 pr-1.5 text-xs placeholder:text-xs placeholder:text-[#ACACAC] @3xl:pl-9 @3xl:pr-3 @3xl:text-sm @3xl:placeholder:text-sm"
          />
        </div>
      </div>

      <div
        className={
          filtersAtStart
            ? 'flex flex-row items-center gap-2 @3xl:flex-wrap @3xl:gap-2.5'
            : 'flex flex-1 flex-row items-center gap-2 @3xl:flex-wrap @3xl:gap-2.5 @3xl:flex-none'
        }
      >
        <VenueFilterSelect
          filter="city"
          value={city}
          options={CITY_OPTIONS}
          onChange={onChangeCity}
          triggerClassName={TRIGGER_CLASS}
        />
        <VenueFilterSelect
          filter="hall"
          value={hall}
          options={hallOptions}
          onChange={onChangeHall}
          triggerClassName={TRIGGER_CLASS}
          disabled={selectDisabled}
        />
        <VenueFilterSelect
          filter="loft"
          value={loft}
          options={loftOptions}
          onChange={onChangeLoft}
          triggerClassName={TRIGGER_CLASS}
          disabled={selectDisabled}
        />
      </div>
    </div>
  )
}
