import { Search } from 'lucide-react'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { Input } from '@/shared/ui/input'

const CITY_OPTIONS = ['Москва', 'Санкт-Петербург', 'Казань']
const HALL_OPTIONS = ['MAIN', 'BACKYARD', 'ROOFTOP']
const LOFT_OPTIONS = ['LOFT#1', 'LOFT#2', 'LOFT#3']

const TRIGGER_CLASS =
  'h-10 min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC] lg:w-41.5 lg:flex-none'

interface ProjectsBoardToolbarProps {
  search: string
  city: string | null
  hall: string | null
  loft: string | null
  onChangeSearch: (value: string) => void
  onChangeCity: (value: string | null) => void
  onChangeHall: (value: string | null) => void
  onChangeLoft: (value: string | null) => void
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
}: ProjectsBoardToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="relative w-full md:w-75">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#ACACAC]" />
        <Input
          type="search"
          placeholder="Поиск проектов"
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="h-10 rounded-[10px] border-[#B1B1B1] bg-white pl-9 placeholder:text-[#ACACAC]"
        />
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2.5 md:flex-none">
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
          options={HALL_OPTIONS}
          onChange={onChangeHall}
          triggerClassName={TRIGGER_CLASS}
        />
        <ClearableSelect
          placeholder="Выберите LOFT"
          value={loft}
          options={LOFT_OPTIONS}
          onChange={onChangeLoft}
          triggerClassName={TRIGGER_CLASS}
        />
      </div>
    </div>
  )
}
