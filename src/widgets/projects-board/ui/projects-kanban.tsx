import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { groupByStage, STAGE_LABELS, STAGE_ORDER, type Project } from '@/entities/project'
import { Card } from '@/shared/ui/card'
import { ProjectsKanbanColumn } from './projects-kanban-column'

interface ProjectsKanbanProps {
  projects: Project[]
}

export function ProjectsKanban({ projects }: ProjectsKanbanProps) {
  const byStage = groupByStage(projects)

  return (
    <Card className="@container flex h-full min-h-0 flex-1 flex-col overflow-visible border-[#B1B1B1] py-0 shadow-none">
      <OverlayScrollbarsComponent
        options={{
          overflow: { x: 'scroll', y: 'scroll' },
          scrollbars: {
            visibility: 'auto',
            autoHide: 'never',
            autoHideDelay: 800,
          },
        }}
        className="projects-kanban-scroll-area h-full min-h-0 w-full min-w-0 flex-1"
      >
        <div className="flex min-w-fit divide-x divide-[#D3D3D3]">
          {STAGE_ORDER.map((stage) => (
            <ProjectsKanbanColumn
              key={stage}
              title={STAGE_LABELS[stage]}
              projects={byStage[stage]}
            />
          ))}
        </div>
      </OverlayScrollbarsComponent>
    </Card>
  )
}
