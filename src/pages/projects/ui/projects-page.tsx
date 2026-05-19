import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { CreateProjectDialog } from '@/features/create-project'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'
import { Button } from '@/shared/ui/button'
import { ProjectsBoard } from '@/widgets/projects-board'

export function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const listDateParams = useMemo(
    () => ({
      event_date_after: toIsoLocalDay(new Date()),
      ordering: PROJECTS_LIST_DEFAULT_ORDERING,
    }),
    [],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Проекты</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            Все проекты, проходящие через MAG. Проекты «Вне контура MAG» см. в отдельном разделе.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 rounded-[10px] bg-black px-4 text-white hover:bg-black/90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Добавить проект
        </Button>
      </header>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ProjectsBoard listDateParams={listDateParams} />
    </div>
  )
}
