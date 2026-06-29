import type { ProjectStage, StageFormData } from '@/entities/project'
import type { ProjectArticles } from '@/entities/project-article'
import type { ClientBlockSchema } from '@/shared/api/generated/types/ClientBlockSchema'
import type { ContractBlockSchema } from '@/shared/api/generated/types/ContractBlockSchema'

import { buildClientPatchBody, mapClientBlockToFormData } from './to-client-patch-body'
import { buildContractPatchBody, mapContractBlockToFormData } from './to-contract-patch-body'
import { buildExpensesPatchBody } from './to-expenses-patch-body'
import { buildSalesPatchBody } from './to-sales-patch-body'

export interface StagePatchContext {
  values: Partial<StageFormData>
  articles: ProjectArticles
  taxRate: number | null
}

export interface StagePatchAdapter {
  /** UI-состояние → тело PATCH. `null`/пусто → запрос не нужен (нечего сохранять). */
  buildBody: (ctx: StagePatchContext) => object | null
  /**
   * Ответ блок-ручки → patch полей формы (мгновенный апдейт до refetch).
   * Задаётся только для block-схем (contract). Для sales/expenses ответ —
   * SalesTotalsSchema/PipelineStateSchema, поэтому полагаемся на invalidate+refetch.
   */
  mapResponse?: (resp: unknown) => Partial<StageFormData>
}

/**
 * Чистые адаптеры «этап → как собрать тело PATCH». Экземпляры мутаций (kubb-хуки)
 * живут в `useStageFlow` (Rules of Hooks). Подключить новый этап = одна запись здесь
 * + builder; этап без записи не редактируется задним числом (`isStagePatchable`).
 */
export const STAGE_PATCH_ADAPTERS: Partial<Record<ProjectStage, StagePatchAdapter>> = {
  plum_request: {
    buildBody: ({ values }) => buildClientPatchBody(values),
    mapResponse: (resp) => mapClientBlockToFormData(resp as ClientBlockSchema),
  },
  contract_signed: {
    buildBody: ({ values }) => buildContractPatchBody(values),
    mapResponse: (resp) => mapContractBlockToFormData(resp as ContractBlockSchema),
  },
  ready_to_event: {
    buildBody: ({ articles, taxRate }) => buildSalesPatchBody({ articles, taxRate }),
  },
  expenses_entered: {
    buildBody: ({ articles, values }) => buildExpensesPatchBody({ articles, values }),
  },
  // primary_contact_done / calculation_prepared / event_held / bonus_calculated —
  // добавятся, когда у бэка появятся соответствующие block-ручки (Фаза 2).
}

/** У этапа есть реальный PATCH-маршрут (кнопка «Редактировать» имеет смысл). */
export function isStagePatchable(stage: ProjectStage): boolean {
  return stage in STAGE_PATCH_ADAPTERS
}
