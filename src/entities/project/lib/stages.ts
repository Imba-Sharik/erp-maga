import type { PreprojectStage, Project, ProjectStage, StageFunnel } from '../model/types'

import { CLOSING_STAGE_LABELS, CLOSING_STAGE_ORDER } from './closing-stages'

export const STAGE_ORDER: readonly PreprojectStage[] = [
  'plum_request',
  'first_contact',
  'calc_ready',
  'signed',
  'ready',
] as const

export const PRE_PROJECT_STAGES = STAGE_ORDER

export const CLOSING_STAGES = CLOSING_STAGE_ORDER

export const STAGE_LABELS: Record<PreprojectStage, string> = {
  plum_request: 'Заявка из PLUM',
  first_contact: 'Первич. контакт выполнен',
  calc_ready: 'Расчёт подготовлен',
  signed: 'Договор подписан',
  ready: 'Готов к проведению',
}

export const ALL_STAGE_LABELS: Record<ProjectStage, string> = {
  ...STAGE_LABELS,
  ...CLOSING_STAGE_LABELS,
}

export const STAGE_FUNNEL: Record<ProjectStage, StageFunnel> = {
  plum_request: 'pre_project',
  first_contact: 'pre_project',
  calc_ready: 'pre_project',
  signed: 'pre_project',
  ready: 'pre_project',
  event_held: 'closing',
  expenses_entered: 'closing',
  documents_confirmed: 'closing',
  data_confirmed: 'closing',
  bonus_calculated: 'closing',
  bonus_approved: 'closing',
  closed: 'closing',
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
    first_contact: [],
    calc_ready: [],
    signed: [],
    ready: [],
  }
  for (const p of projects) {
    if (!isPreprojectStage(p.stage)) continue
    acc[p.stage].push(p)
  }
  return acc
}
