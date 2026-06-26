import { ProjectHeader, type ProjectDetail, type ProjectStage } from '@/entities/project'

interface ProjectDetailMainCardProps {
  project: ProjectDetail
  currentStage?: ProjectStage
}

export function ProjectDetailMainCard({ project, currentStage }: ProjectDetailMainCardProps) {
  return (
    <div className="border-border-strong bg-card @container w-full rounded-[15px] border p-3 @xl:p-6">
      <ProjectHeader project={project} currentStage={currentStage} />
    </div>
  )
}
