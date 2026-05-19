import { isSameDay } from 'date-fns'
import { Card } from '@/shared/ui/card'
import type { ProjectsByDay } from '@/entities/project'
import { cn } from '@/shared/lib/utils'
import { buildMonthMatrix, WEEKDAYS_RU } from '../lib/build-month-matrix'
import { useCalendarPaintSelect, type PaintMode } from '../lib/use-calendar-paint-select'
import { DayCell } from './day-cell'

interface CalendarGridProps {
  visibleMonth: Date
  selectedKeys: ReadonlySet<string>
  today: Date
  projectsByDay: ProjectsByDay
  onToggleDate: (date: Date) => void
  onPaintDates: (keys: string[], mode: PaintMode) => void
  isLoading?: boolean
}

export function CalendarGrid({
  visibleMonth,
  selectedKeys,
  today,
  projectsByDay,
  onToggleDate,
  onPaintDates,
  isLoading = false,
}: CalendarGridProps) {
  const days = buildMonthMatrix(visibleMonth)

  const {
    effectiveSelectedKeys,
    isDragging,
    handleDayPointerDown,
    handleDayPointerEnter,
    shouldSuppressClick,
  } = useCalendarPaintSelect({
    selectedKeys,
    onPaintCommit: onPaintDates,
  })

  return (
    <Card className="gap-0 overflow-hidden border-[#B1B1B1] py-0 shadow-none">
      <div className="grid grid-cols-7 border-b border-[#B1B1B1] bg-[#F3F3F3]">
        {WEEKDAYS_RU.map((wd) => (
          <div key={wd} className="px-1.5 py-2 text-xs text-[#ACACAC] md:px-3 md:py-3 md:text-sm">
            {wd}
          </div>
        ))}
      </div>

      <div className={cn('grid grid-cols-7', isDragging && 'select-none')}>
        {days.map((day, i) => {
          const count = projectsByDay.get(day.key)?.length ?? 0
          const colIdx = i % 7
          const isLastRow = i >= days.length - 7
          return (
            <DayCell
              key={day.key}
              dayKey={day.key}
              dayNum={day.dayNum}
              outOfMonth={day.outOfMonth}
              isToday={isSameDay(day.date, today)}
              isSelected={effectiveSelectedKeys.has(day.key)}
              count={count}
              onSelect={() => {
                if (shouldSuppressClick()) return
                onToggleDate(day.date)
              }}
              onPointerDown={(event) => handleDayPointerDown(day.key, event)}
              onPointerEnter={(event) => handleDayPointerEnter(day.key, event)}
              colIdx={colIdx}
              isLastRow={isLastRow}
              isLoading={isLoading}
            />
          )
        })}
      </div>
    </Card>
  )
}
