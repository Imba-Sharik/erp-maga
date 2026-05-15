import {
  STAGE_ORDER,
  isClosingStage,
  isPreprojectStage,
  type ProjectDetail,
} from '@/entities/project'
import { ProjectStageSection } from '@/widgets/project-stage-section'

export function ProjectDetailStages({ project }: { project: ProjectDetail }) {
  const currentIndex = isPreprojectStage(project.stage)
    ? STAGE_ORDER.indexOf(project.stage)
    : isClosingStage(project.stage)
      ? STAGE_ORDER.length - 1
      : -1

  const stagesToRender = [...STAGE_ORDER].slice(0, currentIndex + 1).reverse()

  return (
    <div className="flex w-full flex-col gap-4">
      {stagesToRender.map((stage) => (
        <ProjectStageSection key={stage} project={project} stage={stage} />
      ))}
    </div>
  )
}
