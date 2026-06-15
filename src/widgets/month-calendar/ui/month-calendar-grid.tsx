import type { ReactNode } from 'react'
import { isSameDay } from 'date-fns'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { buildMonthMatrix, WEEKDAYS_RU } from '../lib/build-month-matrix'
import { useCalendarPaintSelect, type PaintMode } from '../lib/use-calendar-paint-select'
import { MonthDayCell } from './month-day-cell'

interface MonthCalendarGridProps {
  visibleMonth: Date
  selectedKeys: ReadonlySet<string>
  today: Date
  countsByDay?: Map<string, number>
  onToggleDate: (date: Date) => void
  onPaintDates?: (keys: string[], mode: PaintMode) => void
  renderBadge?: (count: number) => ReactNode
  /** Полный контроль над бейджами дня (напр. встречи + напоминания вместе). Приоритетнее `renderBadge`. */
  renderDayBadge?: (dayKey: string) => ReactNode
  isLoading?: boolean
  enablePaintSelect?: boolean
}

export function MonthCalendarGrid({
  visibleMonth,
  selectedKeys,
  today,
  countsByDay,
  onToggleDate,
  onPaintDates,
  renderBadge,
  renderDayBadge,
  isLoading = false,
  enablePaintSelect = true,
}: MonthCalendarGridProps) {
  const days = buildMonthMatrix(visibleMonth)

  const paintSelect = useCalendarPaintSelect({
    selectedKeys,
    onPaintCommit: onPaintDates ?? (() => {}),
  })

  const effectiveSelectedKeys = enablePaintSelect ? paintSelect.effectiveSelectedKeys : selectedKeys
  const isDragging = enablePaintSelect && paintSelect.isDragging

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
          const count = countsByDay?.get(day.key) ?? 0
          const colIdx = i % 7
          const isLastRow = i >= days.length - 7
          const badge = renderDayBadge ? renderDayBadge(day.key) : (renderBadge?.(count) ?? null)
          return (
            <MonthDayCell
              key={day.key}
              dayKey={day.key}
              dayNum={day.dayNum}
              outOfMonth={day.outOfMonth}
              isToday={isSameDay(day.date, today)}
              isSelected={effectiveSelectedKeys.has(day.key)}
              badge={badge}
              onSelect={() => {
                if (enablePaintSelect && paintSelect.shouldSuppressClick()) return
                onToggleDate(day.date)
              }}
              onPointerDown={
                enablePaintSelect
                  ? (event) => paintSelect.handleDayPointerDown(day.key, event)
                  : undefined
              }
              onPointerEnter={
                enablePaintSelect
                  ? (event) => paintSelect.handleDayPointerEnter(day.key, event)
                  : undefined
              }
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
