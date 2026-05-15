import type { ProjectDetail, ProjectStage, StageHistoryEntry } from '@/entities/project'

import { StagePassedBonus } from './stage-passed-bonus'
import { StagePassedExpenses } from './stage-passed-expenses'
import { StagePassedReady } from './stage-passed-ready'
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

  if (stage === 'ready') {
    return <StagePassedReady />
  }

  if (stage === 'expenses_entered') {
    return <StagePassedExpenses />
  }

  if (stage === 'bonus_calculated') {
    return <StagePassedBonus />
  }

  const entry: StageHistoryEntry = project.history.find((h) => h.stage === stage) ?? {
    stage,
    enteredAt: '',
    managerName: '',
    data: {},
  }
  return <StageSectionPassed stage={stage} entry={entry} />
}
