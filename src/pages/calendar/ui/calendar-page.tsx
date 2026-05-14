import { useCallback, useMemo, useRef, useState } from 'react'
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import {
  countProjectsInMonth,
  getProjectsForDates,
  groupByDay,
  mapBackendProjects,
} from '@/entities/project'
import { useProjectsList } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { useElementSize } from '@/shared/hooks/use-element-size'
import { filterProjects } from '@/widgets/projects-board/lib/filter-projects'
import { DaySchedule } from '@/widgets/day-schedule'
import { ProjectCalendar } from '@/widgets/project-calendar'

const WIDE_LAYOUT_MIN_WRAPPER_PX = 1400

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
  const [projectSearch, setProjectSearch] = useState('')

  const { event_date_after, event_date_before } = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 })
    return {
      event_date_after: format(gridStart, 'yyyy-MM-dd'),
      event_date_before: format(gridEnd, 'yyyy-MM-dd'),
    }
  }, [visibleMonth])

  const { data, isLoading, isFetching } = useProjectsList({
    event_date_after,
    event_date_before,
    limit: 100,
  })
  const projects = useMemo(
    () => (data ? mapBackendProjects(data.results) : []),
    [data],
  )

  const projectsByDay = useMemo(
    () =>
      groupByDay(
        filterProjects(projects, {
          search: projectSearch,
          city: null,
          hall,
          loft,
        }),
      ),
    [projects, projectSearch, hall, loft],
  )

  const toggleSelectedDate = useCallback((date: Date) => {
    setSelectedDates((prev) => {
      const exists = prev.some((d) => isSameDay(d, date))
      if (exists) return prev.filter((d) => !isSameDay(d, date))
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime())
    })
  }, [])

  const removeSelectedDate = useCallback((date: Date) => {
    setSelectedDates((prev) => prev.filter((d) => !isSameDay(d, date)))
  }, [])

  const scheduleDays = useMemo(
    () => getProjectsForDates(projectsByDay, selectedDates),
    [projectsByDay, selectedDates],
  )

  const totalThisMonth = useMemo(
    () => countProjectsInMonth(projectsByDay, visibleMonth),
    [projectsByDay, visibleMonth],
  )

  const pageRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const pageSize = useElementSize(pageRef)
  const calendarSize = useElementSize(calendarRef)
  const isWideCalendarLayout = (pageSize?.width ?? 0) >= WIDE_LAYOUT_MIN_WRAPPER_PX
  const scheduleMaxHeightPx =
    isWideCalendarLayout && calendarSize?.height ? calendarSize.height : undefined

  return (
    <div ref={pageRef} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-bold text-[#1B1A17]">Календарь проектов</h1>
        <p className="text-sm text-[#ACACAC]">
          Проекты во «Вне контура MAG» в календаре не отображаются
        </p>
      </header>

      <div className="grid gap-6 @min-[1400px]/main:grid-cols-[minmax(0,1fr)_minmax(360px,540px)] @min-[1400px]/main:items-start @min-[1400px]/main:gap-10">
        <div ref={calendarRef} className="min-h-0 min-w-0">
          <ProjectCalendar
            projectSearch={projectSearch}
            onChangeProjectSearch={setProjectSearch}
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
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </div>
        <div className="min-h-0 min-w-0">
          <DaySchedule
            scheduleDays={scheduleDays}
            maxHeightPx={scheduleMaxHeightPx}
            onRemoveSelectedDay={removeSelectedDate}
          />
        </div>
      </div>
    </div>
  )
}
