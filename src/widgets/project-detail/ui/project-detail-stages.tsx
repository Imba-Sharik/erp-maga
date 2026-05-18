import {
  FUNNEL_LABELS,
  STAGE_FUNNEL,
  type ProjectDetail,
  type ProjectStage,
  type StageFunnel,
} from '@/entities/project'
import type { StageFlow } from '@/features/advance-stage'
import { ProjectStageSection } from '@/widgets/project-stage-section'

function FunnelHeader({ funnel }: { funnel: StageFunnel }) {
  const color = funnel === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  return (
    <div className={`${color} text-sm font-semibold`}>{FUNNEL_LABELS[funnel]}</div>
  )
}

interface ProjectDetailStagesProps {
  project: ProjectDetail
  flow: StageFlow
}

export function ProjectDetailStages({ project, flow }: ProjectDetailStagesProps) {
  const closing: ProjectStage[] = []
  const preproject: ProjectStage[] = []
  for (const stage of flow.visibleStages) {
    if (STAGE_FUNNEL[stage] === 'closing') closing.push(stage)
    else preproject.push(stage)
  }

  const sharedProps = {
    project,
    onAdvance: flow.advance,
    articles: flow.articles,
    taxRate: flow.taxRate,
    onArticleChange: flow.updateArticle,
    onTaxRateChange: flow.setTaxRate,
    onToggleBackline: flow.toggleBackline,
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {closing.length > 0 && <FunnelHeader funnel="closing" />}
      {[...closing].reverse().map((stage) => (
        <ProjectStageSection
          key={stage}
          stage={stage}
          isCurrent={flow.isCurrent(stage)}
          record={flow.getRecord(stage)}
          {...sharedProps}
        />
      ))}
      {preproject.length > 0 && <FunnelHeader funnel="pre_project" />}
      {[...preproject].reverse().map((stage) => (
        <ProjectStageSection
          key={stage}
          stage={stage}
          isCurrent={flow.isCurrent(stage)}
          record={flow.getRecord(stage)}
          {...sharedProps}
        />
      ))}
    </div>
  )
}
