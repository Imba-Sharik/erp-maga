import { Search } from 'lucide-react'
import { useVenueCatalog } from '@/entities/venue'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { Input } from '@/shared/ui/input'

const CITY_OPTIONS = ['Москва', 'Санкт-Петербург', 'Казань']

const TRIGGER_CLASS =
  'h-10! w-full min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC] lg:w-41.5 lg:flex-none'

interface ProjectsBoardToolbarProps {
  search: string
  city: string | null
  hall: string | null
  loft: string | null
  onChangeSearch: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
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
  filtersAlign = 'spread',
}: ProjectsBoardToolbarProps) {
  const { hallOptions, loftOptions, isLoading, isError } = useVenueCatalog()
  const selectDisabled = isLoading || isError
  const filtersAtStart = filtersAlign === 'start'

  return (
    <div
      className={
        filtersAtStart
          ? 'flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-start lg:gap-4'
          : 'flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4'
      }
    >
      <div className="relative w-full min-w-40 md:w-75 self-start">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#ACACAC]" />
        <Input
          type="search"
          placeholder="Поиск проектов"
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-9 placeholder:text-[#ACACAC]"
        />
      </div>

      <div
        className={
          filtersAtStart
            ? 'flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center'
            : 'flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center md:flex-none'
        }
      >
        <ClearableSelect
          placeholder="Выберите город"
          value={city}
          options={CITY_OPTIONS}
          onChange={onChangeCity}
          triggerClassName={TRIGGER_CLASS}
        />
        <ClearableSelect
          placeholder="Выберите зал"
          value={hall}
          options={hallOptions}
          onChange={onChangeHall}
          triggerClassName={TRIGGER_CLASS}
          disabled={selectDisabled}
        />
        <ClearableSelect
          placeholder="Выберите LOFT"
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
