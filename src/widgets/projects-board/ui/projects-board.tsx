import { useMemo, useState } from 'react'

import type { Project } from '@/entities/project'
import { MoveProjectOutsideMagDialog } from '@/features/move-project-outside-mag'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

import { buildKanbanListParams } from '../lib/build-kanban-list-params'
import type { BoardListParams } from '../lib/kanban-board-query'
import { ProjectsBoardToolbar } from './projects-board-toolbar'
import { ProjectsKanban } from './projects-kanban'

interface ProjectsBoardProps {
  listDateParams: BoardListParams
  onAddProject?: () => void
}

export function ProjectsBoard({ listDateParams, onAddProject }: ProjectsBoardProps) {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)
  const [plumEventStatus, setPlumEventStatus] = useState<string | null>(null)
  const [outsideMagTarget, setOutsideMagTarget] = useState<Project | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const filtersActive =
    search.trim() !== '' ||
    city !== null ||
    hall !== null ||
    loft !== null ||
    plumEventStatus !== null

  // Поиск и статус Plum уходят на сервер через listParams; клиентский filter только по фасетам.
  const filter = useMemo(() => ({ search: '', city, hall, loft }), [city, hall, loft])
  const listParams = useMemo(
    () => buildKanbanListParams(listDateParams, { search: debouncedSearch, plumEventStatus }),
    [listDateParams, debouncedSearch, plumEventStatus],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6">
      <ProjectsBoardToolbar
        search={search}
        city={city}
        hall={hall}
        loft={loft}
        plumEventStatus={plumEventStatus}
        onChangeSearch={setSearch}
        onChangeCity={setCity}
        onChangeHall={setHall}
        onChangeLoft={setLoft}
        onChangePlumEventStatus={setPlumEventStatus}
        onAddProject={onAddProject}
      />
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ProjectsKanban
          listParams={listParams}
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
