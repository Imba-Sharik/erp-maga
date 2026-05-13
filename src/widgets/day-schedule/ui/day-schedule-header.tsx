import { pluralProjects } from '@/entities/project'

export function DayScheduleHeader({ count }: { count: number }) {
  return (
    <div className="flex h-10 items-center justify-between">
      <h2 className="text-[22px] leading-none font-bold text-[#1B1A17]">Расписание</h2>
      <span className="text-sm text-[#ACACAC]">{pluralProjects(count)} в этот день</span>
    </div>
  )
}
