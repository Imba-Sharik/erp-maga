import type { PreprojectStage, Project, ProjectStage } from '../model/types'

export const STAGE_ORDER: readonly PreprojectStage[] = [
  'plum_request',
  'first_contact',
  'calc_ready',
  'signed',
  'ready',
] as const

export const STAGE_LABELS: Record<PreprojectStage, string> = {
  plum_request: 'Заявка из PLUM',
  first_contact: 'Первич. контакт выполнен',
  calc_ready: 'Расчёт подготовлен',
  signed: 'Договор подписан',
  ready: 'Готов к проведению',
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
