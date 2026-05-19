import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import {
  CLOSING_STAGE_LABELS,
  CLOSING_STAGE_ORDER,
  closingStageToApi,
  type ClosingStage,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'
import type { ProjectsFilter } from '@/widgets/projects-board/lib/filter-projects'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import { KanbanColumnWithQuery } from '@/widgets/projects-board/ui/kanban-column-with-query'

const CLOSING_BACK = { to: '/closing', label: 'Закрытие' } as const

interface ClosingKanbanProps {
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
}

export function ClosingKanban({ listParams, filter, filtersActive }: ClosingKanbanProps) {
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
          {CLOSING_STAGE_ORDER.map((stage) => (
            <ClosingKanbanColumnItem
              key={stage}
              stage={stage}
              listParams={listParams}
              filter={filter}
              filtersActive={filtersActive}
            />
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </Card>
  )
}

function ClosingKanbanColumnItem({
  stage,
  listParams,
  filter,
  filtersActive,
}: {
  stage: ClosingStage
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
}) {
  return (
    <KanbanColumnWithQuery
      variant="closing"
      scope="board-closing"
      apiStage={closingStageToApi(stage)}
      title={CLOSING_STAGE_LABELS[stage]}
      listParams={listParams}
      filter={filter}
      filtersActive={filtersActive}
      backOrigin={CLOSING_BACK}
    />
  )
}
