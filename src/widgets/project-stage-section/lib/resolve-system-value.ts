import type { ProjectDetail, ProjectStage, StageFormData } from '@/entities/project'
import {
  bonusTotal,
  formatMoney,
  type ProjectArticles,
} from '@/entities/project-articles'
import type { StageRecord } from '@/features/advance-stage'

interface ResolveContext {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
}

/**
 * Возвращает значение системного поля для конкретного этапа.
 * Источники (по приоритету): данные перехода (`record`) → данные проекта → `fallback` (mockValue из конфига).
 *
 * Семантика:
 * - `leadManager` на `bonus_calculated`/`closed` — главный менеджер проекта (`project.manager`).
 *   В остальных случаях — менеджер, который перевёл проект в этот этап (`record.enteredBy`).
 * - `contactedAt`, `closingFunnelEnteredAt`, `*Confirmed*At`, `bonus*At` — момент входа в этап
 *   (`record.enteredAt`), пока бэк не возвращает их отдельно.
 * - `createdAt` — `project.enteredSystemAt` (created_at из бэка).
 * - `eventDate` — `project.date`.
 */
export function resolveSystemValue(
  fieldName: keyof StageFormData,
  fallback: string | undefined,
  { project, stage, record, articles }: ResolveContext,
): string | undefined {
  switch (fieldName) {
    case 'createdAt':
      return project.enteredSystemAt || fallback

    case 'totalBonus':
      // «Итоговый бонус» — сумма bonus_amount по всем статьям (с overrides директора).
      if (articles) return formatMoney(bonusTotal(articles))
      return fallback

    case 'eventDate':
      return project.date || fallback

    case 'leadManager':
      // По ТЗ: на `bonus_calculated` («получатель бонуса») и `closed` («ведущий менеджер»)
      // это всегда главный менеджер проекта, не автор транзишена.
      if (stage === 'bonus_calculated' || stage === 'closed') {
        return project.manager || fallback
      }
      // На остальных этапах — «Статус перевёл менеджер» = автор входа в этап.
      return record?.enteredBy || project.manager || fallback

    case 'projectDocsConfirmedAt':
    case 'subleaseDocsConfirmedAt':
    case 'staffReceiptsConfirmedAt':
    case 'dataConfirmedAt':
      // Per-row штамп от select-onChange; если строка ещё не подтверждена — пусто.
      return record?.values?.[fieldName] || fallback

    case 'projectDocsConfirmedBy':
    case 'subleaseDocsConfirmedBy':
    case 'staffReceiptsConfirmedBy':
    case 'dataConfirmedBy':
      return record?.values?.[fieldName] || fallback

    case 'contactedAt':
    case 'closingFunnelEnteredAt':
    case 'bonusCalculatedAt':
    case 'bonusApprovedAt':
    case 'closedAt':
      return record?.enteredAt || fallback

    case 'bonusApprovedBy':
      return record?.enteredBy || fallback

    default:
      return fallback
  }
}
