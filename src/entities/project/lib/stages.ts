import type {
  OutsideMagStage,
  PreprojectStage,
  Project,
  ProjectStage,
  StageFunnel,
} from '../model/types'

import { CLOSING_STAGE_LABELS, CLOSING_STAGE_ORDER } from './closing-stages'

export const STAGE_ORDER: readonly PreprojectStage[] = [
  'plum_request',
  'primary_contact_done',
  'calculation_prepared',
  'contract_signed',
  'ready_to_event',
] as const

export const PRE_PROJECT_STAGES = STAGE_ORDER

export const CLOSING_STAGES = CLOSING_STAGE_ORDER

/** Полный порядок этапов воронки: предпроектная → закрывающая. */
export const ALL_STAGE_ORDER: readonly ProjectStage[] = [
  ...STAGE_ORDER,
  ...CLOSING_STAGE_ORDER,
] as const

export const STAGE_LABELS: Record<PreprojectStage, string> = {
  plum_request: 'Заявка из PLUM',
  primary_contact_done: 'Первич. контакт выполнен',
  calculation_prepared: 'Расчёт подготовлен',
  contract_signed: 'Договор подписан',
  ready_to_event: 'Готов к проведению',
}

export const OUTSIDE_MAG_STAGE_LABEL = 'Вне контура MAG'

export const ALL_STAGE_LABELS: Record<ProjectStage, string> = {
  ...STAGE_LABELS,
  ...CLOSING_STAGE_LABELS,
  out_of_mag_scope: OUTSIDE_MAG_STAGE_LABEL,
}

export const STAGE_FUNNEL: Record<ProjectStage, StageFunnel> = {
  plum_request: 'pre_project',
  primary_contact_done: 'pre_project',
  calculation_prepared: 'pre_project',
  contract_signed: 'pre_project',
  ready_to_event: 'pre_project',
  event_held: 'closing',
  expenses_entered: 'closing',
  documents_confirmed: 'closing',
  data_confirmed: 'closing',
  bonus_calculated: 'closing',
  bonus_approved: 'closing',
  closed: 'closing',
  out_of_mag_scope: 'closing',
}

export function isOutsideMagStage(stage: ProjectStage): stage is OutsideMagStage {
  return stage === 'out_of_mag_scope'
}

export const FUNNEL_LABELS: Record<StageFunnel, string> = {
  pre_project: 'Предпроектная воронка',
  closing: 'Закрывающая воронка',
}

export function isPreprojectStage(stage: ProjectStage): stage is PreprojectStage {
  return (STAGE_ORDER as readonly string[]).includes(stage)
}

export type ProjectsByStage = Record<PreprojectStage, Project[]>

export function groupByStage(projects: Project[]): ProjectsByStage {
  const acc: ProjectsByStage = {
    plum_request: [],
    primary_contact_done: [],
    calculation_prepared: [],
    contract_signed: [],
    ready_to_event: [],
  }
  for (const p of projects) {
    if (!isPreprojectStage(p.stage)) continue
    acc[p.stage].push(p)
  }
  return acc
}
