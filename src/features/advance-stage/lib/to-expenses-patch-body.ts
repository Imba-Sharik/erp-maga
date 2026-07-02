import type { ProjectArticles } from '@/entities/project-article'
import type { StageFormData } from '@/entities/project'
import type { PatchedExpenseBlockUpdateRequest } from '@/shared/api/generated/types/PatchedExpenseBlockUpdateRequest'

import { blockAspectToDecimals } from './articles-to-decimals'

interface BuildExpensesPatchBodyArgs {
  articles: ProjectArticles
  values?: Partial<StageFormData>
}

/**
 * UI → PATCH /projects/{id}/expenses/ (этап `expenses_entered`, правка задним числом).
 * Тело — плоские суммы расходов основного блока + комментарий + вложенный `backline`.
 *
 * Бэклайн-расходы бэк принимает отдельным вложенным объектом `backline`
 * (BACKLINE_EXPENSE_ARTICLES), без коллизии имён с основным блоком — та же форма,
 * что у бэклайн-продаж в `/sales/` (см. to-sales-patch-body).
 */
export function buildExpensesPatchBody({
  articles,
  values,
}: BuildExpensesPatchBodyArgs): PatchedExpenseBlockUpdateRequest | null {
  const body = blockAspectToDecimals(articles.main, 'expense') as PatchedExpenseBlockUpdateRequest
  // Комментарий к расходам хранится в UI под `postEventComment` (см. fields-map).
  if (values?.postEventComment !== undefined) {
    body.comment = values.postEventComment
  }
  // Бэклайн существует только если менеджер его добавил (иначе `articles.backline === null`).
  if (articles.backline) {
    const backline = blockAspectToDecimals(articles.backline, 'expense')
    if (Object.keys(backline).length > 0) body.backline = backline
  }
  return Object.keys(body).length > 0 ? body : null
}
