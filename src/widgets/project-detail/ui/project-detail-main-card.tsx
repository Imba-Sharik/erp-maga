import { ProjectHeader, type ProjectDetail } from '@/entities/project'

export function ProjectDetailMainCard({ project }: { project: ProjectDetail }) {
  return (
    <div className="w-full rounded-[15px] border border-[#B1B1B1] bg-white p-6">
      <ProjectHeader project={project} />
    </div>
  )
}
