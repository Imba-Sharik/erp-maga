import type { ClosingStage, Project, ProjectStage } from '../model/types'

export const CLOSING_STAGE_ORDER: readonly ClosingStage[] = [
  'event_held',
  'expenses_entered',
  'documents_confirmed',
  'feedback_received',
  'data_confirmed',
  'bonus_calculated',
  'bonus_approved',
] as const

export const CLOSING_STAGE_LABELS: Record<ClosingStage, string> = {
  event_held: 'Мероприятие проведено',
  expenses_entered: 'Расходы внесены',
  documents_confirmed: 'Документы подтверждены',
  feedback_received: 'Обратная связь по проекту получена',
  data_confirmed: 'Данные подтверждены',
  bonus_calculated: 'Бонус рассчитан',
  bonus_approved: 'Бонус утверждён',
}

export type ProjectsByClosingStage = Record<ClosingStage, Project[]>

export function isClosingStage(stage: ProjectStage): stage is ClosingStage {
  return (CLOSING_STAGE_ORDER as readonly string[]).includes(stage)
}

export function groupByClosingStage(projects: Project[]): ProjectsByClosingStage {
  const acc: ProjectsByClosingStage = {
    event_held: [],
    expenses_entered: [],
    documents_confirmed: [],
    feedback_received: [],
    data_confirmed: [],
    bonus_calculated: [],
    bonus_approved: [],
  }
  for (const p of projects) {
    if (!isClosingStage(p.stage)) continue
    acc[p.stage].push(p)
  }
  return acc
}
