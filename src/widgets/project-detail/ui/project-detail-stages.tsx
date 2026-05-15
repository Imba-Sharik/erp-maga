import {
  CLOSING_STAGES,
  FUNNEL_LABELS,
  PRE_PROJECT_STAGES,
  type ProjectDetail,
  type StageFunnel,
} from '@/entities/project'
import { ProjectStageSection } from '@/widgets/project-stage-section'

function FunnelHeader({ funnel }: { funnel: StageFunnel }) {
  const color = funnel === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  return (
    <div className={`${color} text-sm font-semibold`}>{FUNNEL_LABELS[funnel]}</div>
  )
}

export function ProjectDetailStages({ project }: { project: ProjectDetail }) {
  const closingReversed = [...CLOSING_STAGES].reverse()
  const preProjectReversed = [...PRE_PROJECT_STAGES].reverse()

  return (
    <div className="flex w-full flex-col gap-4">
      <FunnelHeader funnel="closing" />
      {closingReversed.map((stage) => (
        <ProjectStageSection key={stage} project={project} stage={stage} />
      ))}
      <FunnelHeader funnel="pre_project" />
      {preProjectReversed.map((stage) => (
        <ProjectStageSection key={stage} project={project} stage={stage} />
      ))}
    </div>
  )
}
