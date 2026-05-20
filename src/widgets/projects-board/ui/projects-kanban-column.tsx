import { DEFAULT_PROJECTS_BACK_ORIGIN } from '@/entities/project'

import { PipelineKanbanColumn, type PipelineKanbanColumnProps } from './pipeline-kanban-column'

type ProjectsKanbanColumnProps = Omit<
  PipelineKanbanColumnProps,
  'headerAccentClassName' | 'backOrigin'
>

export function ProjectsKanbanColumn(props: ProjectsKanbanColumnProps) {
  return (
    <PipelineKanbanColumn
      {...props}
      headerAccentClassName="bg-funnel-preproject"
      backOrigin={DEFAULT_PROJECTS_BACK_ORIGIN}
    />
  )
}
