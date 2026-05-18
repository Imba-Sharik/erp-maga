import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  groupByStage,
  PRE_PROJECT_STAGES,
  STAGE_LABELS,
  type PreprojectStage,
  type Project,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'
import { ProjectsKanbanColumn } from './projects-kanban-column'

interface ProjectsKanbanProps {
  projects: Project[]
  totalsByStage?: Partial<Record<PreprojectStage, number>>
  filtersActive?: boolean
  onLoadMore?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function ProjectsKanban({
  projects,
  totalsByStage,
  filtersActive = false,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: ProjectsKanbanProps) {
  const byStage = groupByStage(projects)
  const firstStage = PRE_PROJECT_STAGES[0]

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
          {PRE_PROJECT_STAGES.map((stage) => {
            const isFirst = stage === firstStage
            return (
              <ProjectsKanbanColumn
                key={stage}
                title={STAGE_LABELS[stage]}
                projects={byStage[stage]}
                backendTotalCount={totalsByStage?.[stage]}
                filtersActive={filtersActive}
                onLoadMore={isFirst ? onLoadMore : undefined}
                hasNextPage={isFirst ? hasNextPage : false}
                isFetchingNextPage={isFirst ? isFetchingNextPage : false}
              />
            )
          })}
        </div>
      </OverlayScrollbarsComponent>
    </Card>
  )
}
