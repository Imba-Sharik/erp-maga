import type { Project, ProjectStage, StageFunnel } from '../model/types'

export const PRE_PROJECT_STAGES: readonly ProjectStage[] = [
  'plum_request',
  'first_contact',
  'calc_ready',
  'signed',
  'ready',
] as const

export const CLOSING_STAGES: readonly ProjectStage[] = [
  'event_held',
  'expenses_entered',
  'documents_confirmed',
  'data_confirmed',
  'bonus_calculated',
  'bonus_approved',
  'closed',
] as const

export const STAGE_ORDER: readonly ProjectStage[] = [
  ...PRE_PROJECT_STAGES,
  ...CLOSING_STAGES,
] as const

export const STAGE_LABELS: Record<ProjectStage, string> = {
  plum_request: 'Заявка из PLUM',
  first_contact: 'Первич. контакт выполнен',
  calc_ready: 'Расчёт подготовлен',
  signed: 'Договор подписан',
  ready: 'Готов к проведению',
  event_held: 'Мероприятие проведено',
  expenses_entered: 'Расходы внесены',
  documents_confirmed: 'Документы подтверждены',
  data_confirmed: 'Данные подтверждены',
  bonus_calculated: 'Бонус рассчитан',
  bonus_approved: 'Бонус утверждён',
  closed: 'Проект закрыт',
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

export type ProjectsByStage = Record<ProjectStage, Project[]>

export function groupByStage(projects: Project[]): ProjectsByStage {
  const acc = STAGE_ORDER.reduce(
    (m, s) => ({ ...m, [s]: [] as Project[] }),
    {} as ProjectsByStage,
  )
  for (const p of projects) acc[p.stage].push(p)
  return acc
}
