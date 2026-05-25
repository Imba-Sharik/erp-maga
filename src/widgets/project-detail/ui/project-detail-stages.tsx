import {
  FUNNEL_LABELS,
  STAGE_FUNNEL,
  type ProjectDetail,
  type ProjectStage,
  type StageFunnel,
} from '@/entities/project'
import { isStageSkipped, type StageFlow } from '@/features/advance-stage'
import { useProjectTab } from '@/features/project-tabs'
import {
  presentationFromTab,
  STAGE_PRESENTATION,
} from '@/widgets/project-detail/lib/stage-presentation'
import { ProjectStageSection } from '@/widgets/project-stage-section'

/** Этапы с финансовыми блоками (Продажная часть / Расходы / Бонус) — видны во вкладке «Экономика». */
const ECONOMICS_STAGES = new Set<ProjectStage>([
  'ready_to_event',
  'expenses_entered',
  'bonus_calculated',
])

function FunnelHeader({ funnel }: { funnel: StageFunnel }) {
  const color = funnel === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  return <div className={`${color} text-sm font-semibold`}>{FUNNEL_LABELS[funnel]}</div>
}

interface ProjectDetailStagesProps {
  project: ProjectDetail
  flow: StageFlow
}

export function ProjectDetailStages({ project, flow }: ProjectDetailStagesProps) {
  const [tab] = useProjectTab()
  const economicsOnly = tab === 'economics'
  const presentation = STAGE_PRESENTATION[presentationFromTab(tab)]

  const closing: ProjectStage[] = []
  const preproject: ProjectStage[] = []
  for (const stage of flow.visibleStages) {
    if (economicsOnly && !ECONOMICS_STAGES.has(stage)) continue
    if (STAGE_FUNNEL[stage] === 'closing') closing.push(stage)
    else preproject.push(stage)
  }

  const sharedProps = {
    presentation,
    project,
    onAdvance: flow.advance,
    onPatchValues: flow.patchCurrentStageValues,
    onPatchStageValues: flow.patchStageValues,
    articles: flow.articles,
    taxRate: flow.taxRate,
    onArticleChange: flow.updateArticle,
    onTaxRateChange: flow.setTaxRate,
    onToggleBackline: flow.toggleBackline,
    getRecord: flow.getRecord,
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {presentation.showFunnelHeaders && closing.length > 0 && <FunnelHeader funnel="closing" />}
      {[...closing].reverse().map((stage) => (
        <ProjectStageSection
          key={stage}
          stage={stage}
          isCurrent={flow.isCurrent(stage)}
          isSkipped={isStageSkipped(stage, flow.currentStage, flow.records)}
          record={flow.getRecord(stage)}
          {...sharedProps}
        />
      ))}
      {presentation.showFunnelHeaders && preproject.length > 0 && (
        <FunnelHeader funnel="pre_project" />
      )}
      {[...preproject].reverse().map((stage) => (
        <ProjectStageSection
          key={stage}
          stage={stage}
          isCurrent={flow.isCurrent(stage)}
          isSkipped={isStageSkipped(stage, flow.currentStage, flow.records)}
          record={flow.getRecord(stage)}
          {...sharedProps}
        />
      ))}
    </div>
  )
}
