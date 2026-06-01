import { useState } from 'react'

import { CreateProjectDialog } from '@/features/create-project'
import { Button } from '@/shared/ui/button'
import { ProjectsTable } from '@/widgets/projects-table'

export function DirectorAllProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="@container flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Все проекты</h1>
          <p className="hidden max-w-[640px] text-sm text-[#ACACAC] md:block">Все проекты, проходящие через MAG</p>
        </div>
        <Button
          type="button"
          className="hidden h-10 rounded-[10px] bg-black px-4 text-white hover:bg-black/90 @3xl:inline-flex"
          onClick={() => setCreateOpen(true)}
        >
          Добавить проект
        </Button>
      </header>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ProjectsTable onAddProject={() => setCreateOpen(true)} />
    </div>
  )
}
