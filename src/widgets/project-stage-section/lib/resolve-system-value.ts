import type { ProjectDetail, ProjectStage, StageFormData } from '@/entities/project'
import type { StageRecord } from '@/features/advance-stage'

interface ResolveContext {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
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
  { project, stage, record }: ResolveContext,
): string | undefined {
  switch (fieldName) {
    case 'createdAt':
      return project.enteredSystemAt || fallback

    case 'eventDate':
      return project.date || fallback

    case 'leadManager':
      if (stage === 'bonus_calculated' || stage === 'closed') {
        return project.manager || fallback
      }
      return record?.enteredBy || project.manager || fallback

    case 'contactedAt':
    case 'closingFunnelEnteredAt':
    case 'projectDocsConfirmedAt':
    case 'subleaseDocsConfirmedAt':
    case 'staffReceiptsConfirmedAt':
    case 'dataConfirmedAt':
    case 'bonusCalculatedAt':
    case 'bonusApprovedAt':
    case 'closedAt':
      return record?.enteredAt || fallback

    case 'projectDocsConfirmedBy':
    case 'subleaseDocsConfirmedBy':
    case 'staffReceiptsConfirmedBy':
    case 'dataConfirmedBy':
    case 'bonusApprovedBy':
      return record?.enteredBy || fallback

    default:
      return fallback
  }
}
