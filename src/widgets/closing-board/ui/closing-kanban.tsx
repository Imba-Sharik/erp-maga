import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  CLOSING_STAGE_LABELS,
  CLOSING_STAGE_ORDER,
  groupByClosingStage,
  type Project,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'
import { PipelineKanbanColumn } from '@/widgets/projects-board/ui/pipeline-kanban-column'

const CLOSING_BACK = { to: '/closing', label: 'Закрытие' } as const

interface ClosingKanbanProps {
  projects: Project[]
  onLoadMore?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function ClosingKanban({
  projects,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: ClosingKanbanProps) {
  const byStage = groupByClosingStage(projects)
  const firstStage = CLOSING_STAGE_ORDER[0]

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
          {CLOSING_STAGE_ORDER.map((stage) => {
            const isFirst = stage === firstStage
            return (
              <PipelineKanbanColumn
                key={stage}
                title={CLOSING_STAGE_LABELS[stage]}
                projects={byStage[stage]}
                headerAccentClassName="bg-funnel-closing"
                backOrigin={CLOSING_BACK}
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
