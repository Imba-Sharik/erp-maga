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
      // Сидинг в `useStageFlow` уже подменяет `enteredBy` на текущего пользователя,
      // если бэк не прислал `*_set_by`, поэтому здесь дополнительного fallback не нужно.
      return record?.enteredBy ?? undefined

    case 'projectDocsConfirmedAt':
    case 'subleaseDocsConfirmedAt':
    case 'staffReceiptsConfirmedAt':
    case 'dataConfirmedAt':
      // Только с бэка; mockValue и локальные заглушки не подставляем.
      return record?.values?.[fieldName] ?? undefined

    case 'projectDocsConfirmedBy':
    case 'subleaseDocsConfirmedBy':
    case 'staffReceiptsConfirmedBy':
    case 'dataConfirmedBy':
      return record?.values?.[fieldName] ?? undefined

    case 'contactedAt':
    case 'closingFunnelEnteredAt':
    case 'bonusCalculatedAt':
    case 'bonusApprovedAt':
    case 'closedAt':
      // Без fallback на mockValue — лучше пусто, чем выдуманная дата 2026-05-09.
      return record?.enteredAt ?? undefined

    case 'bonusApprovedBy':
      return record?.enteredBy ?? undefined

    default:
      return fallback
  }
}
