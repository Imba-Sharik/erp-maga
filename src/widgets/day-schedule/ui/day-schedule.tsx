import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { type ScheduleDayRow } from '@/entities/project'
import { cn } from '@/shared/lib/utils'
import { Card } from '@/shared/ui/card'
import { DayScheduleHeader } from './day-schedule-header'
import { ScheduleDaySection } from './schedule-day-section'

interface DayScheduleProps {
  scheduleDays: ScheduleDayRow[]
  /** На широкой вёрстке: ограничить колонку по высоте календаря; контент карточки прокручивается */
  maxHeightPx?: number
  onRemoveSelectedDay: (date: Date) => void
}

export function DaySchedule({ scheduleDays, maxHeightPx, onRemoveSelectedDay }: DayScheduleProps) {
  const daysSelectedCount = scheduleDays.length
  const totalProjects = scheduleDays.reduce((sum, row) => sum + row.projects.length, 0)
  const heightCapped = maxHeightPx != null && maxHeightPx > 0

  return (
    <div
      className={cn('flex flex-col gap-4', heightCapped && 'min-h-0 overflow-visible')}
      style={heightCapped ? { maxHeight: maxHeightPx } : undefined}
    >
      <DayScheduleHeader projectsCount={totalProjects} daysSelectedCount={daysSelectedCount} />
      <Card
        className={cn(
          'gap-2.5 border-[#B1B1B1] p-2.5 shadow-none',
          heightCapped && 'flex min-h-0 flex-1 flex-col overflow-visible',
        )}
      >
        <OverlayScrollbarsComponent
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: {
              visibility: 'auto',
              autoHide: 'never',
              autoHideDelay: 800,
            },
          }}
          className={cn('day-schedule-scroll-area', heightCapped && 'min-h-0 flex-1')}
        >
          {daysSelectedCount === 0 ? (
            <p className="px-1 py-4 text-sm text-[#ACACAC]">
              Выберите один или несколько дней в календаре слева.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {scheduleDays.map((row, idx) => (
                <ScheduleDaySection
                  key={row.key}
                  date={row.date}
                  projects={row.projects}
                  withDivider={idx < daysSelectedCount - 1}
                  onRemoveSelectedDay={onRemoveSelectedDay}
                />
              ))}
            </div>
          )}
        </OverlayScrollbarsComponent>
      </Card>
    </div>
  )
}
