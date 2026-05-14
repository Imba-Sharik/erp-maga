import { getMonth, getYear, setMonth, setYear } from 'date-fns'
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

const SELECT_TRIGGER_ROW =
  'h-10 min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC]'

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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-2.5">
      <div className="w-full min-w-0 lg:w-[min(100%,300px)] lg:max-w-[300px] lg:shrink-0">
        <SearchBar
          placeholder="Поиск проектов"
          value={projectSearch}
          onChange={(e) => onChangeProjectSearch(e.target.value)}
          groupClassName="w-full"
        />
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2.5 lg:shrink-0 lg:flex-nowrap">
        <ClearableSelect
          placeholder="Выберите зал"
          value={hall}
          options={HALL_OPTIONS}
          onChange={onChangeHall}
          triggerClassName={`${SELECT_TRIGGER_ROW} min-w-[9.5rem] lg:w-39.25 lg:flex-none`}
        />
        <ClearableSelect
          placeholder="Выберите LOFT"
          value={loft}
          options={LOFT_OPTIONS}
          onChange={onChangeLoft}
          triggerClassName={`${SELECT_TRIGGER_ROW} min-w-[9.5rem] lg:w-41.5 lg:flex-none`}
        />

        <Select
          value={String(year)}
          onValueChange={(v) => onChangeMonth(setYear(visibleMonth, Number(v)))}
        >
          <SelectTrigger
            className={`${SELECT_TRIGGER_ROW} w-23 flex-none md:flex-1 lg:w-23 lg:flex-none`}
          >
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

        <Select
          value={String(monthIndex)}
          onValueChange={(v) => onChangeMonth(setMonth(visibleMonth, Number(v)))}
        >
          <SelectTrigger
            className={`${SELECT_TRIGGER_ROW} min-w-34 flex-none md:min-w-38 md:flex-1 lg:w-44 lg:flex-none`}
          >
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
      </div>
    </div>
  )
}
