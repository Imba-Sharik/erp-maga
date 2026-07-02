import type { ProjectArticles } from '@/entities/project-article'
import type { PatchedSalesBlockUpdateRequest } from '@/shared/api/generated/types/PatchedSalesBlockUpdateRequest'

import { blockAspectToDecimals, toDecimalString } from './articles-to-decimals'

interface BuildSalesPatchBodyArgs {
  articles: ProjectArticles
  taxRate: number | null
}

/**
 * UI → PATCH /projects/{id}/sales/ (этап `ready_to_event`, правка задним числом).
 * Тело — плоские суммы продаж основного блока + единый % налога + вложенный `backline`
 * (бэклайн-продажи; бэк принимает его отдельным объектом, как у расходов).
 */
export function buildSalesPatchBody({
  articles,
  taxRate,
}: BuildSalesPatchBodyArgs): PatchedSalesBlockUpdateRequest | null {
  const body = blockAspectToDecimals(articles.main, 'sales') as PatchedSalesBlockUpdateRequest
  const tax = toDecimalString(taxRate)
  if (tax !== undefined) body.contract_tax_percent = tax
  // Бэклайн существует только если менеджер его добавил (иначе `articles.backline === null`).
  if (articles.backline) {
    const backline = blockAspectToDecimals(articles.backline, 'sales')
    if (Object.keys(backline).length > 0) body.backline = backline
  }
  return Object.keys(body).length > 0 ? body : null
}
