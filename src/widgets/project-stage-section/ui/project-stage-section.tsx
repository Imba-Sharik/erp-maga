import type { ProjectDetail, ProjectStage } from '@/entities/project'

import { StageSectionCurrent } from './stage-section-current'
import { StageSectionPassed } from './stage-section-passed'

interface ProjectStageSectionProps {
  project: ProjectDetail
  stage: ProjectStage
}

export function ProjectStageSection({ project, stage }: ProjectStageSectionProps) {
  if (project.stage === stage) {
    return <StageSectionCurrent project={project} />
  }
  const entry = project.history.find((h) => h.stage === stage)
  if (!entry) return null
  return <StageSectionPassed stage={stage} entry={entry} />
}
