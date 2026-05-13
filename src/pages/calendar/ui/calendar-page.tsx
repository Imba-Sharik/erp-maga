import { useMemo, useState } from 'react'
import { startOfMonth } from 'date-fns'
import { groupByDay, mockProjects } from '@/entities/project'
import { DaySchedule } from '@/widgets/day-schedule'
import { ProjectCalendar } from '@/widgets/project-calendar'

const TODAY = new Date(2026, 4, 13)

export function CalendarPage() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(TODAY))
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 4, 15))
  const [loft, setLoft] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)

  const projectsByDay = useMemo(() => groupByDay(mockProjects), [])

  const selectedKey = useMemo(() => {
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [selectedDate])

  const dayProjects = projectsByDay.get(selectedKey) ?? []

  const totalThisMonth = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    return mockProjects.filter((p) => {
      const d = new Date(p.date)
      return d.getFullYear() === year && d.getMonth() === month
    }).length
  }, [visibleMonth])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-bold text-[#1B1A17]">Календарь проектов</h1>
        <p className="text-sm text-[#ACACAC]">
          Проекты во «Вне контура MAG» в календаре не отображаются
        </p>
      </header>

      <div className="grid gap-6 min-[1400px]:grid-cols-[minmax(0,1fr)_minmax(360px,540px)] min-[1400px]:gap-10">
        <ProjectCalendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          today={TODAY}
          projectsByDay={projectsByDay}
          loft={loft}
          hall={hall}
          onChangeMonth={setVisibleMonth}
          onSelectDate={setSelectedDate}
          onChangeLoft={setLoft}
          onChangeHall={setHall}
          totalThisMonth={totalThisMonth}
        />
        <DaySchedule selectedDate={selectedDate} projects={dayProjects} />
      </div>
    </div>
  )
}
