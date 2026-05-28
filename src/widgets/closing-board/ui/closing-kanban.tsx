import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import {
  CLOSING_STAGE_LABELS,
  CLOSING_STAGE_ORDER,
  closingStageToApi,
  type ClosingStage,
  type Project,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'
import type { ProjectsFilter } from '@/widgets/projects-board/lib/filter-projects'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'
import { KanbanColumnWithQuery } from '@/widgets/projects-board/ui/kanban-column-with-query'

interface ClosingKanbanProps {
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
  backOrigin: { to: string; label: string }
  onChangeManager?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
}

export function ClosingKanban({
  listParams,
  filter,
  filtersActive,
  backOrigin,
  onChangeManager,
  onDeleteProject,
}: ClosingKanbanProps) {
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
              backOrigin={backOrigin}
              onChangeManager={onChangeManager}
              onDeleteProject={onDeleteProject}
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
  backOrigin,
  onChangeManager,
  onDeleteProject,
}: {
  stage: ClosingStage
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
  backOrigin: { to: string; label: string }
  onChangeManager?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
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
      backOrigin={backOrigin}
      onChangeManager={onChangeManager}
      onDeleteProject={onDeleteProject}
    />
  )
}
