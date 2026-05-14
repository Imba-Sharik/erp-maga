import { useCallback, useMemo, useRef, useState } from 'react'
import { isSameDay, startOfMonth } from 'date-fns'
import {
  countProjectsInMonth,
  getProjectsForDates,
  groupByDay,
  mapBackendProjects,
} from '@/entities/project'
import { useProjectsList } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { useElementHeight } from '@/shared/hooks/use-element-height'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { DaySchedule } from '@/widgets/day-schedule'
import { ProjectCalendar } from '@/widgets/project-calendar'

const WIDE_CALENDAR_QUERY = '(min-width: 1400px)'

export function CalendarPage() {
  const {
    today,
    visibleMonth: initialVisibleMonth,
    initialSelectedDates,
  } = useMemo(() => {
    const now = new Date()
    return {
      today: now,
      visibleMonth: startOfMonth(now),
      initialSelectedDates: [now] as Date[],
    }
  }, [])

  const [visibleMonth, setVisibleMonth] = useState(initialVisibleMonth)
  const [selectedDates, setSelectedDates] = useState<Date[]>(initialSelectedDates)
  const [loft, setLoft] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)

  const { data } = useProjectsList({ limit: 200 })
  const projects = useMemo(
    () => (data ? mapBackendProjects(data.results) : []),
    [data],
  )
  const projectsByDay = useMemo(() => groupByDay(projects), [projects])

  const toggleSelectedDate = useCallback((date: Date) => {
    setSelectedDates((prev) => {
      const exists = prev.some((d) => isSameDay(d, date))
      if (exists) return prev.filter((d) => !isSameDay(d, date))
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime())
    })
  }, [])

  const scheduleDays = useMemo(
    () => getProjectsForDates(projectsByDay, selectedDates),
    [projectsByDay, selectedDates],
  )

  const totalThisMonth = useMemo(
    () => countProjectsInMonth(projectsByDay, visibleMonth),
    [projectsByDay, visibleMonth],
  )

  const calendarRef = useRef<HTMLDivElement>(null)
  const isWideCalendarLayout = useMediaQuery(WIDE_CALENDAR_QUERY)
  const calendarHeightPx = useElementHeight(calendarRef)
  const scheduleMaxHeightPx =
    isWideCalendarLayout && calendarHeightPx != null && calendarHeightPx > 0
      ? calendarHeightPx
      : undefined

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-bold text-[#1B1A17]">Календарь проектов</h1>
        <p className="text-sm text-[#ACACAC]">
          Проекты во «Вне контура MAG» в календаре не отображаются
        </p>
      </header>

      <div className="grid gap-6 min-[1400px]:grid-cols-[minmax(0,1fr)_minmax(360px,540px)] min-[1400px]:items-start min-[1400px]:gap-10">
        <div ref={calendarRef} className="min-h-0 min-w-0">
          <ProjectCalendar
            visibleMonth={visibleMonth}
            selectedDates={selectedDates}
            today={today}
            projectsByDay={projectsByDay}
            loft={loft}
            hall={hall}
            onChangeMonth={setVisibleMonth}
            onToggleDate={toggleSelectedDate}
            onChangeLoft={setLoft}
            onChangeHall={setHall}
            totalThisMonth={totalThisMonth}
          />
        </div>
        <div className="min-h-0 min-w-0">
          <DaySchedule scheduleDays={scheduleDays} maxHeightPx={scheduleMaxHeightPx} />
        </div>
      </div>
    </div>
  )
}
