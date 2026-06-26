import type { ReactNode } from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import {
  PRE_PROJECT_STAGES,
  STAGE_LABELS,
  preprojectStageToApi,
  type PreprojectStage,
  type Project,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'

import type { BoardListParams } from '@/shared/api'
import { KanbanColumnWithQuery } from '@/features/kanban-board'

interface ProjectsKanbanProps {
  listParams: BoardListParams
  onClaimProject?: (project: Project) => void
  onMoveOutsideMag?: (project: Project) => void
  renderAssistantMenu?: (project: Project) => ReactNode
}

export function ProjectsKanban({
  listParams,
  onClaimProject,
  onMoveOutsideMag,
  renderAssistantMenu,
}: ProjectsKanbanProps) {
  return (
    <Card className="border-border-strong @container flex h-full min-h-0 flex-1 flex-col overflow-visible py-0 shadow-none">
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
        <div className="divide-border-medium flex h-full min-w-fit divide-x">
          {PRE_PROJECT_STAGES.map((stage) => (
            <ProjectsKanbanColumnItem
              key={stage}
              stage={stage}
              listParams={listParams}
              onClaimProject={onClaimProject}
              onMoveOutsideMag={onMoveOutsideMag}
              renderAssistantMenu={renderAssistantMenu}
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
  onClaimProject,
  onMoveOutsideMag,
  renderAssistantMenu,
}: {
  stage: PreprojectStage
  listParams: BoardListParams
  onClaimProject?: (project: Project) => void
  onMoveOutsideMag?: (project: Project) => void
  renderAssistantMenu?: (project: Project) => ReactNode
}) {
  return (
    <KanbanColumnWithQuery
      variant="preproject"
      scope="board-preproject"
      apiStage={preprojectStageToApi(stage)}
      title={STAGE_LABELS[stage]}
      listParams={listParams}
      onClaimProject={onClaimProject}
      onMoveOutsideMag={onMoveOutsideMag}
      renderAssistantMenu={renderAssistantMenu}
    />
  )
}
