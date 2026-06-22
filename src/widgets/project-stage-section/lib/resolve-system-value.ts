import type { ProjectDetail, ProjectStage, StageFormData } from '@/entities/project'
import { bonusTotal, formatMoney, type ProjectArticles } from '@/entities/project-articles'
import type { StageRecord } from '@/features/advance-stage'

interface ResolveContext {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
}

/** Метка готовности мероприятия по коду `event_readiness` (с бэка — `ready`/`not_ready`). */
const EVENT_READINESS_LABELS: Record<string, string> = {
  ready: 'Был готов',
  not_ready: 'Не был готов',
}

/**
 * Возвращает значение системного поля для конкретного этапа — строго из реальных
 * данных (данные перехода `record` → данные проекта → финансовые статьи). Никаких
 * demo/mock-подстановок: если источника нет, возвращается `undefined` (UI рисует «—»),
 * чтобы в финансовом ERP не отображались выдуманные суммы/статусы.
 *
 * Семантика:
 * - `leadManager` на `bonus_calculated`/`closed` — главный менеджер проекта (`project.manager`).
 *   В остальных случаях — менеджер, который перевёл проект в этот этап (`record.enteredBy`).
 * - `eventReadiness` — `record.values.eventReadiness` (`ready`/`not_ready`), приведённый к метке.
 * - `contactedAt`, `closingFunnelEnteredAt`, `bonus*At`, `closedAt` — момент входа в этап
 *   (`record.enteredAt`), пока бэк не возвращает их отдельно.
 * - `*Confirmed*At`/`*Confirmed*By`, `dataConfirmed*` — точечные штампы с бэка (`record.values`).
 * - `createdAt` — `project.enteredSystemAt` (created_at из бэка). `eventDate` — `project.date`.
 * - `totalBonus` — сумма бонусов по статьям (`bonusTotal(articles)`).
 *
 * Замечание: финансовые этапы (ready/expenses/bonus_calculated) рендерятся отдельными
 * finance-компонентами и сюда не попадают — их тоталы считаются там, из `articles`.
 */
export function resolveSystemValue(
  fieldName: keyof StageFormData,
  { project, stage, record, articles }: ResolveContext,
): string | undefined {
  switch (fieldName) {
    case 'createdAt':
      return project.enteredSystemAt || undefined

    case 'totalBonus':
      // «Итоговый бонус» — сумма bonus_amount по всем статьям (с overrides директора).
      return articles ? formatMoney(bonusTotal(articles)) : undefined

    case 'eventDate':
      return project.date || undefined

    case 'eventReadiness':
      // record.values.eventReadiness хранит 'ready' | 'not_ready' (см. from-backend).
      return record?.values?.eventReadiness
        ? EVENT_READINESS_LABELS[record.values.eventReadiness]
        : undefined

    case 'leadManager':
      // По ТЗ: на `bonus_calculated` («получатель бонуса») и `closed` («ведущий менеджер»)
      // это всегда главный менеджер проекта, не автор транзишена.
      if (stage === 'bonus_calculated' || stage === 'closed') {
        return project.manager || undefined
      }
      // На остальных этапах — «Статус перевёл менеджер» = автор входа в этап.
      // Сидинг в `useStageFlow` уже подменяет `enteredBy` на текущего пользователя,
      // если бэк не прислал `*_set_by`.
      return record?.enteredBy ?? undefined

    case 'projectDocsConfirmedAt':
    case 'subleaseDocsConfirmedAt':
    case 'staffReceiptsConfirmedAt':
    case 'dataConfirmedAt':
      // Только с бэка; никаких локальных заглушек.
      return record?.values?.[fieldName] ?? undefined

    case 'projectDocsConfirmedBy':
    case 'subleaseDocsConfirmedBy':
    case 'staffReceiptsConfirmedBy':
      return record?.values?.[fieldName] ?? undefined

    case 'dataConfirmedBy':
      // Per-row штамп с бэка (`data_confirmation_by`); fallback — старый маппинг и локальный flow.
      return (
        record?.values?.dataConfirmedBy ?? record?.completedBy ?? record?.enteredBy ?? undefined
      )

    case 'contactedAt':
    case 'closingFunnelEnteredAt':
    case 'bonusCalculatedAt':
    case 'bonusApprovedAt':
    case 'closedAt':
      // Момент входа в этап — лучше пусто, чем выдуманная дата.
      return record?.enteredAt ?? undefined

    case 'bonusApprovedBy':
      return record?.enteredBy ?? undefined

    default:
      // Нет реального источника данных — пусто. Demo/mock-значения не подставляем.
      return undefined
  }
}
