import { addMonths, getMonth, getYear, setYear, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ClearableSelect } from '@/shared/ui/clearable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

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

interface CalendarToolbarProps {
  visibleMonth: Date
  onChangeMonth: (date: Date) => void
  loft: string | null
  onChangeLoft: (loft: string | null) => void
  hall: string | null
  onChangeHall: (hall: string | null) => void
}

export function CalendarToolbar({
  visibleMonth,
  onChangeMonth,
  loft,
  onChangeLoft,
  hall,
  onChangeHall,
}: CalendarToolbarProps) {
  const monthName = MONTHS_RU[getMonth(visibleMonth)]
  const year = getYear(visibleMonth)

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 items-center gap-1 rounded-[10px] border border-[#B1B1B1] bg-white px-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onChangeMonth(subMonths(visibleMonth, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-15 text-center text-sm">{monthName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onChangeMonth(addMonths(visibleMonth, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Select
          value={String(year)}
          onValueChange={(v) => onChangeMonth(setYear(visibleMonth, Number(v)))}
        >
          <SelectTrigger className="h-10 w-23 rounded-[10px] border-[#B1B1B1] bg-white">
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
      </div>

      <div className="flex flex-1 items-center gap-2.5 lg:flex-none">
        <ClearableSelect
          placeholder="Выберите LOFT"
          value={loft}
          options={LOFT_OPTIONS}
          onChange={onChangeLoft}
          triggerClassName="h-10 min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC] lg:w-41.5 lg:flex-none"
        />
        <ClearableSelect
          placeholder="Выберите зал"
          value={hall}
          options={HALL_OPTIONS}
          onChange={onChangeHall}
          triggerClassName="h-10 min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white data-placeholder:text-[#BCBCBC] lg:w-39.25 lg:flex-none"
        />
      </div>
    </div>
  )
}
