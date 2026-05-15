import { PipelineKanbanColumn, type PipelineKanbanColumnProps } from './pipeline-kanban-column'

const PROJECTS_BACK = { to: '/projects', label: 'Все проекты' } as const

type ProjectsKanbanColumnProps = Omit<
  PipelineKanbanColumnProps,
  'headerAccentClassName' | 'backOrigin'
>

export function ProjectsKanbanColumn(props: ProjectsKanbanColumnProps) {
  return (
    <PipelineKanbanColumn
      {...props}
      headerAccentClassName="bg-funnel-preproject"
      backOrigin={PROJECTS_BACK}
    />
  )
}
