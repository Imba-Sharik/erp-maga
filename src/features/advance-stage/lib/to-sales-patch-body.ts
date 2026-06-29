import type { ProjectArticles } from '@/entities/project-article'
import type { PatchedSalesBlockUpdateRequest } from '@/shared/api/generated/types/PatchedSalesBlockUpdateRequest'

import { blockAspectToDecimals, toDecimalString } from './articles-to-decimals'

interface BuildSalesPatchBodyArgs {
  articles: ProjectArticles
  taxRate: number | null
}

/**
 * UI → PATCH /projects/{id}/sales/ (этап `ready_to_event`, правка задним числом).
 * Тело — плоские суммы продаж основного блока + единый % налога.
 *
 * TODO(backend): эндпойнт `/sales/` пока не принимает бэклайн (нет поля в схеме) —
 * бэклайн-продажи правятся отдельно (Фаза 2). Partial update не трогает их.
 */
export function buildSalesPatchBody({
  articles,
  taxRate,
}: BuildSalesPatchBodyArgs): PatchedSalesBlockUpdateRequest | null {
  const body = blockAspectToDecimals(articles.main, 'sales') as PatchedSalesBlockUpdateRequest
  const tax = toDecimalString(taxRate)
  if (tax !== undefined) body.contract_tax_percent = tax
  return Object.keys(body).length > 0 ? body : null
}
