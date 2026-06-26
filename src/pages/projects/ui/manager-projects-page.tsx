import { useMemo, useState } from 'react'

import { CreateProjectDialog } from '@/features/create-project'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants'
import { Button } from '@/shared/ui/button'
import { ProjectsBoard } from '@/widgets/projects-board'

export function ManagerProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const listDateParams = useMemo(
    () => ({
      ordering: PROJECTS_LIST_DEFAULT_ORDERING,
    }),
    [],
  )

  return (
    <div className="@container flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Проекты</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            Все проекты, проходящие через MAG. Проекты «Вне контура MAG» см. в отдельном разделе.
          </p>
        </div>
        <Button
          type="button"
          className="hidden h-10 rounded-[10px] bg-black px-4 text-white hover:bg-black/90 @4xl:inline-flex"
          onClick={() => setCreateOpen(true)}
        >
          Добавить проект
        </Button>
      </header>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ProjectsBoard listDateParams={listDateParams} onAddProject={() => setCreateOpen(true)} />
    </div>
  )
}
