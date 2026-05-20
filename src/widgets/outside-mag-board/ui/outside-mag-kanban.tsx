import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import { Card } from '@/shared/ui/card'
import type { ProjectsFilter } from '@/widgets/projects-board/lib/filter-projects'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import { KanbanColumnWithQuery } from '@/widgets/projects-board/ui/kanban-column-with-query'

const OUTSIDE_MAG_BACK = { to: '/outside-mag', label: 'Вне контура MAG' } as const

interface OutsideMagKanbanProps {
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
}

export function OutsideMagKanban({ listParams, filter, filtersActive }: OutsideMagKanbanProps) {
  return (
    <Card className="@container flex h-full min-h-0 flex-1 flex-col overflow-visible border-[#B1B1B1] py-0 shadow-none">
      <OverlayScrollbarsComponent
        options={{
          overflow: { x: 'scroll', y: 'hidden' },
          scrollbars: {
            visibility: 'auto',
            autoHide: 'never',
            autoHideDelay: 800,
          },
        }}
        className="projects-kanban-scroll-area h-full min-h-0 w-full min-w-0 flex-1"
      >
        <div className="flex h-full min-w-fit divide-x divide-[#D3D3D3]">
          <KanbanColumnWithQuery
            variant="closing"
            scope="board-outside-mag"
            apiStage="out_of_mag_scope"
            title="Вне контура MAG"
            listParams={listParams}
            filter={filter}
            filtersActive={filtersActive}
            backOrigin={OUTSIDE_MAG_BACK}
          />
        </div>
      </OverlayScrollbarsComponent>
    </Card>
  )
}
