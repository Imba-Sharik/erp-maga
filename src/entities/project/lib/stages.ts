import type { Project, ProjectStage } from '../model/types'

export const STAGE_ORDER: readonly ProjectStage[] = [
  'plum_request',
  'first_contact',
  'calc_ready',
  'signed',
  'ready',
] as const

export const STAGE_LABELS: Record<ProjectStage, string> = {
  plum_request: 'Заявка из PLUM',
  first_contact: 'Первич. контакт выполнен',
  calc_ready: 'Расчёт подготовлен',
  signed: 'Договор подписан',
  ready: 'Готов к проведению',
}

export type ProjectsByStage = Record<ProjectStage, Project[]>

export function groupByStage(projects: Project[]): ProjectsByStage {
  const acc: ProjectsByStage = {
    plum_request: [],
    first_contact: [],
    calc_ready: [],
    signed: [],
    ready: [],
  }
  for (const p of projects) acc[p.stage].push(p)
  return acc
}
