import type { ProjectDetail, PreprojectStage } from '@/entities/project'

import { StageSectionCurrent } from './stage-section-current'
import { StageSectionPassed } from './stage-section-passed'

interface ProjectStageSectionProps {
  project: ProjectDetail
  stage: PreprojectStage
}

export function ProjectStageSection({ project, stage }: ProjectStageSectionProps) {
  if (project.stage === stage) {
    return <StageSectionCurrent project={project} stage={stage} />
  }
  const entry = project.history.find((h) => h.stage === stage)
  if (!entry) return null
  return <StageSectionPassed stage={stage} entry={entry} />
}
