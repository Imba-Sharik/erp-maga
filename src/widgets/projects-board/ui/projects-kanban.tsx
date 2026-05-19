import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import {
  PRE_PROJECT_STAGES,
  STAGE_LABELS,
  preprojectStageToApi,
  type PreprojectStage,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'

import type { ProjectsFilter } from '../lib/filter-projects'
import type { BoardListParams } from '../lib/kanban-board-query'
import { KanbanColumnWithQuery } from './kanban-column-with-query'

interface ProjectsKanbanProps {
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
}

export function ProjectsKanban({ listParams, filter, filtersActive }: ProjectsKanbanProps) {
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
          {PRE_PROJECT_STAGES.map((stage) => (
            <ProjectsKanbanColumnItem
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

function ProjectsKanbanColumnItem({
  stage,
  listParams,
  filter,
  filtersActive,
}: {
  stage: PreprojectStage
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
}) {
  return (
    <KanbanColumnWithQuery
      variant="preproject"
      scope="board-preproject"
      apiStage={preprojectStageToApi(stage)}
      title={STAGE_LABELS[stage]}
      listParams={listParams}
      filter={filter}
      filtersActive={filtersActive}
    />
  )
}
