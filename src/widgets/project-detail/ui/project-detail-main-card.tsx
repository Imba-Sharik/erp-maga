import { ProjectHeader, type ProjectDetail, type ProjectStage } from '@/entities/project'

interface ProjectDetailMainCardProps {
  project: ProjectDetail
  currentStage?: ProjectStage
}

export function ProjectDetailMainCard({ project, currentStage }: ProjectDetailMainCardProps) {
  return (
    <div className="w-full rounded-[15px] border border-[#B1B1B1] bg-white p-6">
      <ProjectHeader project={project} currentStage={currentStage} />
    </div>
  )
}
