import {
  groupByStage,
  STAGE_LABELS,
  STAGE_ORDER,
  type Project,
} from '@/entities/project'
import { Card } from '@/shared/ui/card'
import { ProjectsKanbanColumn } from './projects-kanban-column'

interface ProjectsKanbanProps {
  projects: Project[]
}

export function ProjectsKanban({ projects }: ProjectsKanbanProps) {
  const byStage = groupByStage(projects)

  return (
    <Card className="@container overflow-hidden border-[#B1B1B1] py-0 shadow-none">
      <div className="overflow-x-auto">
        <div className="flex min-w-fit divide-x divide-[#D3D3D3]">
          {STAGE_ORDER.map((stage) => (
            <ProjectsKanbanColumn
              key={stage}
              title={STAGE_LABELS[stage]}
              projects={byStage[stage]}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
