export {
  CLOSED_REQUESTS_BACK_ORIGIN,
  CLOSING_BACK_ORIGIN,
  DEFAULT_PROJECTS_BACK_ORIGIN,
  OUTSIDE_MAG_BACK_ORIGIN,
  REQUESTS_BACK_ORIGIN,
  resolveProjectBackFromPathname,
  resolveRequestBackFromPathname,
} from './model/project-back-origins'
export { projectDetailPath } from './lib/project-detail-path'
export type { StageDocumentFieldVariant } from '@/entities/project-document'
export { getStageDocumentFieldVariant } from '@/entities/project-document'
export type {
  Project,
  ProjectEconomics,
  ProjectStage,
  PreprojectStage,
  ClosingStage,
  OutsideMagStage,
  ArchivedStage,
  StageFunnel,
  ProjectBackOrigin,
  ProjectDetail,
  ProjectFinance,
  StageFormData,
  StageHistoryEntry,
  ContractType,
  ContactChannel,
  DocumentStatus,
  EventReadiness,
  PlumStatus,
} from './model/types'
export {
  mapBackendProject,
  mapBackendProjects,
  mapBackendProjectDetail,
  mapBackendOutOfMagProject,
  mapBackendOutOfMagProjects,
  mapBackendCalendarProject,
  mapBackendCalendarProjects,
} from './lib/from-backend'
export { projectToApiListRow } from './lib/project-to-api-list-row'
export { resolveProjectReadOnly } from './lib/project-edit-access'
export { getOutsideMagReasonLabel } from './lib/outside-mag-reason'
export { PREPROJECT_STAGE_TO_API, preprojectStageToApi } from './lib/preproject-stage-api'
export { CLOSING_STAGE_TO_API, closingStageToApi } from './lib/closing-stage-api'
export {
  PROJECTS_TABLE_DEFAULT_STAGE_IN,
  PROJECTS_TABLE_PENDING_STAGE_IN,
  PROJECTS_TABLE_PENDING_STAGE_IN_PARAM,
} from './lib/projects-table-stage-in'
export { projectStageToApi } from './lib/project-stage-api'
export {
  stageFormSchemas,
  getStageFormSchema,
  contactChannelLabels,
  contractTypeLabels,
} from './lib/stage-form-schemas'
export type { StageFormValues } from './lib/stage-form-schemas'
export { groupByDay, toDayKey } from './lib/group-by-day'
export type { ProjectsByDay } from './lib/group-by-day'
export { getProjectsForDates, countProjectsInMonth } from './lib/schedule'
export type { ScheduleDayRow } from './lib/schedule'
export {
  STAGE_ORDER,
  STAGE_LABELS,
  ALL_STAGE_LABELS,
  ALL_STAGE_ORDER,
  STAGE_FUNNEL,
  FUNNEL_LABELS,
  PRE_PROJECT_STAGES,
  CLOSING_STAGES,
  ARCHIVED_STAGE_LABEL,
  groupByStage,
  isPreprojectStage,
  isOutsideMagStage,
  isArchivedStage,
} from './lib/stages'
export type { ProjectsByStage } from './lib/stages'
export {
  CLOSING_STAGE_ORDER,
  CLOSING_STAGE_LABELS,
  groupByClosingStage,
  isClosingStage,
} from './lib/closing-stages'
export { hasReachedFinanceStages, isStageAtLeast } from './lib/stage-order'
export type { ProjectsByClosingStage } from './lib/closing-stages'
export type { OutsideMagReason } from './lib/outside-mag-reason'
export { OUTSIDE_MAG_REASON_OPTIONS } from './lib/outside-mag-reason'
export { pluralProjects } from './lib/plural'
export { buildTelegramPhoneUrl } from './lib/build-telegram-phone-url'
export { shouldShowPlumStatusLine, formatPlumStatusTableValue } from './lib/plum-status'
export {
  PLUM_EVENT_STATUS_LABELS,
  PLUM_EVENT_STATUS_OPTIONS,
  plumEventStatusFilterQueryParams,
} from './lib/plum-event-status-catalog'
export type {
  PlumEventStatusFilterQueryParams,
  PlumEventStatusFilterValues,
} from './lib/plum-event-status-catalog'
export {
  PROJECTS_SORT_DEFAULT,
  PROJECTS_SORT_FIELD_CREATED,
  PROJECTS_SORT_FIELD_EVENT_DATE,
  PROJECTS_SORT_OPTIONS,
  buildProjectsSortValue,
  parseProjectsSort,
} from './lib/projects-sort-catalog'
export { ProjectCard } from './ui/project-card'
export { ProjectCountBadge } from './ui/project-count-badge'
export { ProjectPipelineCard } from './ui/project-pipeline-card'
export { ProjectPlumStatusLine } from './ui/project-plum-status-line'
export { ProjectPlumStatusTableCell } from './ui/project-plum-status-table-cell'
export { ProjectTelegramLink } from './ui/project-telegram-link'
export { ProjectStageBadge } from './ui/project-stage-badge'
export { ProjectManagerBadge } from './ui/project-manager-badge'
export { ProjectHeader } from './ui/project-header'
export { PlumLink } from './ui/plum-link'
export { KvRow } from './ui/kv-row'
export { ProjectAsideCard } from './ui/project-aside-card'
export { PlumEventStatusFilterSelect } from './ui/plum-event-status-filter-select'
export { ProjectsSortSelect } from './ui/projects-sort-select'
