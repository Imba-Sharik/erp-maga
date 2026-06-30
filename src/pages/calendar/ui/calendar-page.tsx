import { useCallback, useMemo, useRef, useState } from 'react'
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { mergeDates, removeDates } from '@/shared/ui/month-calendar'
import { filterCalendarProjects } from '@/widgets/project-calendar'
import type { PaintMode } from '@/shared/ui/month-calendar'
import { useCurrentUser } from '@/entities/current-user'
import { useManagerVenueRestriction, useManagersDirectory } from '@/entities/manager'
import {
  countProjectsInMonth,
  getProjectsForDates,
  groupByDay,
  mapBackendCalendarProjects,
} from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import { useProjectsCalendarList } from '@/shared/api/generated/hooks/projectsController/useProjectsCalendarList'
import { useElementSize, useFilterParams } from '@/shared/hooks'
import { DaySchedule } from '@/widgets/day-schedule'
import { ProjectCalendar } from '@/widgets/project-calendar'

const WIDE_LAYOUT_MIN_WRAPPER_PX = 1400

/** Ключи URL, которые персистим для календаря проектов (месяц/дни — навигация, не персистим). */
const CALENDAR_FILTER_KEYS = ['q', 'loft', 'hall', 'manager', 'plum'] as const

function parseMagManagerId(magManagerId: string | null): number | undefined {
  if (!magManagerId) return undefined
  const id = Number(magManagerId)
  return Number.isFinite(id) ? id : undefined
}

export function CalendarPage() {
  const role = useUserRole()
  const currentUser = useCurrentUser()
  // ERP-217: фильтр «Отв. менеджер» доступен и менеджеру (режим просмотра как у руководителя).
  // По умолчанию выбран он сам (видит свои); может очистить → все или выбрать другого менеджера.
  const isManagerRole = role === 'manager'
  const showManagerFilter = role === 'director' || role === 'admin' || isManagerRole
  const {
    managers,
    filterOptions: baseManagerOptions,
    isLoading: managersSelectLoading,
    isError: managersSelectError,
  } = useManagersDirectory()

  // Свой mag-manager id — дефолт селекта для менеджера (строка, как value у опций директории).
  const ownManagerId = useMemo(() => {
    const id = Number(currentUser.id)
    return Number.isFinite(id) && id > 0 ? String(id) : null
  }, [currentUser.id])

  // Гарантируем наличие собственного пункта (директория может не вернуть его менеджеру).
  const managerFilterOptions = useMemo(() => {
    if (!isManagerRole || !ownManagerId) return baseManagerOptions
    if (baseManagerOptions.some((o) => o.value === ownManagerId)) return baseManagerOptions
    return [{ value: ownManagerId, label: currentUser.displayName }, ...baseManagerOptions]
  }, [baseManagerOptions, isManagerRole, ownManagerId, currentUser.displayName])
  const { today, visibleMonth: initialVisibleMonth } = useMemo(() => {
    const now = new Date()
    return {
      today: now,
      visibleMonth: startOfMonth(now),
    }
  }, [])

  // Месяц и выбранные дни — навигация, в URL не сохраняем (локальный useState).
  const [visibleMonth, setVisibleMonth] = useState(initialVisibleMonth)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])

  // Фильтры/поиск живут в URL (переживают F5, шарятся ссылкой) и дублируются в localStorage
  // (переживают закрытие вкладки / новое окно).
  const { getString, getArray, set, patch } = useFilterParams({
    scope: 'calendar',
    params: CALENDAR_FILTER_KEYS,
  })
  const loft = getString('loft')
  const hall = useMemo(() => getArray('hall'), [getArray])
  const projectSearch = getString('q') ?? ''
  const plumEventStatus = useMemo(() => getArray('plum'), [getArray])
  const setLoft = (value: string | null) => set('loft', value)
  const setHall = (value: string[]) => set('hall', value)
  const setProjectSearch = (value: string) => set('q', value)
  const setPlumEventStatus = (values: string[]) => set('plum', values)

  // Менеджер: нет параметра — не трогали (дефолт по роли); `all` — явно «все»; иначе id.
  const rawManager = getString('manager')
  const magManagerSelection: string | null | undefined =
    rawManager === null ? undefined : rawManager === 'all' ? null : rawManager
  const magManagerId =
    magManagerSelection === undefined ? (isManagerRole ? ownManagerId : null) : magManagerSelection

  const { event_date_after, event_date_before } = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 })
    return {
      event_date_after: format(gridStart, 'yyyy-MM-dd'),
      event_date_before: format(gridEnd, 'yyyy-MM-dd'),
    }
  }, [visibleMonth])

  // Используем `/projects/calendar/` — отдельную лёгкую ручку без пагинации,
  // которая уже фильтрует `out_of_mag_scope` на сервере. Возвращает 9-полевую
  // карточку (event_name/halls/mag_manager/stage), достаточно для сетки.
  const magManagerParam = showManagerFilter ? parseMagManagerId(magManagerId) : undefined

  const { restrictToHallIds, venueSelectDisabled } = useManagerVenueRestriction({
    managerId: magManagerId,
    managers,
    enabled: showManagerFilter,
    managersLoading: managersSelectLoading,
  })

  // Смена менеджера сбрасывает зал и LOFT (могут быть недоступны у нового менеджера);
  // `null` («все») кодируем как `all`, чтобы отличать от «не трогали» (нет параметра).
  const handleChangeMagManager = useCallback(
    (value: string | null) => {
      patch({ manager: value === null ? 'all' : value, hall: [], loft: null })
    },
    [patch],
  )

  const { data, isLoading, isFetching } = useProjectsCalendarList({
    event_date_after,
    event_date_before,
    ...(magManagerParam !== undefined ? { mag_manager: magManagerParam } : {}),
  })
  const projects = useMemo(() => (data ? mapBackendCalendarProjects(data.results) : []), [data])

  const projectsByDay = useMemo(
    () =>
      groupByDay(
        filterCalendarProjects(projects, {
          search: projectSearch,
          hall,
          loft,
          plumEventStatus,
        }),
      ),
    [projects, projectSearch, hall, loft, plumEventStatus],
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

  const applyPaintedDates = useCallback((keys: string[], mode: PaintMode) => {
    const dates = keys.map((key) => parse(key, 'yyyy-MM-dd', new Date()))
    setSelectedDates((prev) =>
      mode === 'add' ? mergeDates(prev, dates) : removeDates(prev, dates),
    )
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
        <h1 className="font-heading text-foreground font-bold">Календарь проектов</h1>
        <p className="text-muted-foreground hidden text-sm md:block">
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
            onPaintDates={applyPaintedDates}
            onChangeLoft={setLoft}
            onChangeHall={setHall}
            showManagerFilter={showManagerFilter}
            magManagerId={magManagerId}
            onChangeMagManager={handleChangeMagManager}
            managerFilterOptions={managerFilterOptions}
            managersSelectLoading={managersSelectLoading}
            managersSelectError={managersSelectError}
            restrictToHallIds={restrictToHallIds}
            venueSelectDisabled={venueSelectDisabled}
            plumEventStatus={plumEventStatus}
            onChangePlumEventStatus={setPlumEventStatus}
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
