import { useState } from 'react'

import { CreateProjectDialog } from '@/features/create-project'
import { Button } from '@/shared/ui/button'

import { AllProjectsView } from './all-projects-view'

export function ManagerProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)

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
          className="bg-primary text-primary-foreground hover:bg-primary/90 hidden h-10 rounded-[10px] px-4 @4xl:inline-flex"
          onClick={() => setCreateOpen(true)}
        >
          Добавить проект
        </Button>
      </header>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AllProjectsView
        defaultView="kanban"
        managerEditable={false}
        onAddProject={() => setCreateOpen(true)}
      />
    </div>
  )
}
