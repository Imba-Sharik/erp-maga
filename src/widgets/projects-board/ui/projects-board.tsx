import { useMemo, useState } from 'react'

import type { Project } from '@/entities/project'
import { MoveProjectOutsideMagDialog } from '@/features/move-project-outside-mag'

import type { BoardListParams } from '../lib/kanban-board-query'
import { ProjectsBoardToolbar } from './projects-board-toolbar'
import { ProjectsKanban } from './projects-kanban'

interface ProjectsBoardProps {
  listDateParams: BoardListParams
}

export function ProjectsBoard({ listDateParams }: ProjectsBoardProps) {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)
  const [outsideMagTarget, setOutsideMagTarget] = useState<Project | null>(null)

  const filtersActive = search.trim() !== '' || city !== null || hall !== null || loft !== null

  const filter = useMemo(() => ({ search, city, hall, loft }), [search, city, hall, loft])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <ProjectsBoardToolbar
        search={search}
        city={city}
        hall={hall}
        loft={loft}
        onChangeSearch={setSearch}
        onChangeCity={setCity}
        onChangeHall={setHall}
        onChangeLoft={setLoft}
      />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ProjectsKanban
          listParams={listDateParams}
          filter={filter}
          filtersActive={filtersActive}
          onMoveOutsideMag={setOutsideMagTarget}
        />
      </div>

      <MoveProjectOutsideMagDialog
        open={outsideMagTarget !== null}
        onOpenChange={(open) => {
          if (!open) setOutsideMagTarget(null)
        }}
        project={outsideMagTarget}
      />
    </div>
  )
}
