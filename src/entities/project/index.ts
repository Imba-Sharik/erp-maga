export type {
  Project,
  ProjectStatus,
  ProjectStage,
  ProjectBackOrigin,
  ProjectDetail,
  ProjectFinance,
  StageFormData,
  StageHistoryEntry,
  ContractType,
  ContactChannel,
  PlumStatus,
} from './model/types'
export { mockProjects } from './model/mock'
export { mockProjectDetail, getProjectDetailById } from './model/mock-detail'
export {
  stageFormSchemas,
  contactChannelLabels,
  contractTypeLabels,
} from './lib/stage-form-schemas'
export type { StageFormValues } from './lib/stage-form-schemas'
export { groupByDay, toDayKey } from './lib/group-by-day'
export type { ProjectsByDay } from './lib/group-by-day'
export { getProjectsForDates, countProjectsInMonth } from './lib/schedule'
export type { ScheduleDayRow } from './lib/schedule'
export { STAGE_ORDER, STAGE_LABELS, groupByStage } from './lib/stages'
export type { ProjectsByStage } from './lib/stages'
export { pluralProjects } from './lib/plural'
export { ProjectCard } from './ui/project-card'
export { ProjectCountBadge } from './ui/project-count-badge'
export { ProjectPipelineCard } from './ui/project-pipeline-card'
export { ProjectStatusBadge } from './ui/project-status-badge'
export { ProjectStageBadge } from './ui/project-stage-badge'
export { ProjectHeader } from './ui/project-header'
export { PlumLink } from './ui/plum-link'
export { KvRow } from './ui/kv-row'
export { ProjectAsideCard } from './ui/project-aside-card'
