import { useMemo, useState } from 'react'

import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import { ProjectsBoardToolbar } from '@/widgets/projects-board/ui/projects-board-toolbar'
import { OutsideMagKanban } from './outside-mag-kanban'

interface OutsideMagBoardProps {
  listDateParams: BoardListParams
}

export function OutsideMagBoard({ listDateParams }: OutsideMagBoardProps) {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [hall, setHall] = useState<string | null>(null)
  const [loft, setLoft] = useState<string | null>(null)

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
        <OutsideMagKanban
          listParams={listDateParams}
          filter={filter}
          filtersActive={filtersActive}
        />
      </div>
    </div>
  )
}
