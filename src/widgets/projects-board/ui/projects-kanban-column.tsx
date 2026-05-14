import { ProjectPipelineCard, type Project } from '@/entities/project'

interface ProjectsKanbanColumnProps {
  title: string
  projects: Project[]
}

export function ProjectsKanbanColumn({ title, projects }: ProjectsKanbanColumnProps) {
  return (
    <div className="flex w-70 shrink-0 flex-col @[1400px]:w-auto @[1400px]:min-w-65 @[1400px]:flex-1">
      <div className="bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-2 px-4 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-[#454545]">{title}</span>
            <span className="shrink-0 text-xs text-[#ACACAC]">{projects.length}</span>
          </div>
          <div className="h-1.25 rounded-b-[5px] bg-funnel-preproject" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {projects.length === 0 ? (
          <p className="text-xs text-[#ACACAC]">Пусто</p>
        ) : (
          projects.map((p) => (
            <ProjectPipelineCard
              key={p.id}
              project={p}
              backOrigin={{ to: '/projects', label: 'Все проекты' }}
            />
          ))
        )}
      </div>
    </div>
  )
}
