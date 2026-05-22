import { ALL_STAGE_ORDER, type Project, type ProjectStage } from '@/entities/project'

export { formatTableMoney } from '@/shared/lib/format-table-money'

export type ProjectsTableColumnView =
  | 'general'
  | 'economics'
  | 'outside-mag'
  | 'closing-general'
  | 'closing-economics'
  | 'requests'
  | 'closed-requests'

const STAGE_INDEX = new Map<ProjectStage, number>(
  ALL_STAGE_ORDER.map((stage, index) => [stage, index]),
)

function isStageAtLeast(stage: ProjectStage, threshold: ProjectStage): boolean {
  const current = STAGE_INDEX.get(stage)
  const min = STAGE_INDEX.get(threshold)
  if (current === undefined || min === undefined) return false
  return current >= min
}

export function resolveSalesTotal(project: Project): number | null {
  if (!isStageAtLeast(project.stage, 'ready_to_event')) return null
  return project.economics?.salesProjectTotal ?? null
}

export function resolveNetProfitTotal(project: Project): number | null {
  if (!isStageAtLeast(project.stage, 'bonus_calculated')) return null
  return project.economics?.netProfitTotal ?? null
}

export function resolveTotalBonus(project: Project): number | null {
  if (!isStageAtLeast(project.stage, 'bonus_calculated')) return null

  const economics = project.economics
  if (!economics) return null

  if (project.stage === 'bonus_approved' || project.stage === 'closed') {
    return economics.bonusApprovedTotal
  }

  return economics.bonusCalculatedTotal
}
