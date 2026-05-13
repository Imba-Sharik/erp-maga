import { Plus } from 'lucide-react'
import { mockProjects } from '@/entities/project'
import { Button } from '@/shared/ui/button'
import { ProjectsBoard } from '@/widgets/projects-board'

export function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-bold text-[#1B1A17]">Проекты</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Все проекты, проходящие через MAG. Проекты «Вне контура MAG» см. в отдельном разделе.
          </p>
        </div>
        <Button className="h-10 rounded-[10px] bg-black px-4 text-white hover:bg-black/90">
          <Plus className="size-4" />
          Добавить проект
        </Button>
      </header>

      <ProjectsBoard projects={mockProjects} />
    </div>
  )
}
