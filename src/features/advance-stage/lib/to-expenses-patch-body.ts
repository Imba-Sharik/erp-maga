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
 * Тело — плоские суммы расходов основного блока + комментарий к расходам.
 *
 * TODO(backend): бэклайн-расходы (`backline`-объект в схеме) не отправляем — его
 * форма пока не зафиксирована (Фаза 2). Partial update не трогает их.
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
  return Object.keys(body).length > 0 ? body : null
}
