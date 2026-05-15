import type { Project } from '@/entities/project'
import { ClosingBoard } from '@/widgets/closing-board'

const EMPTY_PROJECTS: Project[] = []

export function ClosingPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-bold text-[#1B1A17]">Закрытие</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Проекты на этапах закрытия после проведения мероприятия.
          </p>
        </div>
      </header>

      <ClosingBoard projects={EMPTY_PROJECTS} />
    </div>
  )
}
