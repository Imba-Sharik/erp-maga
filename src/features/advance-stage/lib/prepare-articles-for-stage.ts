import type { ProjectStage } from '@/entities/project'
import {
  normalizeAspectZeroToNull,
  type FinanceAspect,
  type ProjectArticles,
} from '@/entities/project-articles'

const STAGE_FINANCE_ASPECT: Partial<Record<ProjectStage, FinanceAspect>> = {
  ready_to_event: 'sales',
  expenses_entered: 'expense',
}

export function financeAspectForStage(stage: ProjectStage): FinanceAspect | null {
  return STAGE_FINANCE_ASPECT[stage] ?? null
}

/** Подготовка статей к редактированию на текущем финансовом этапе воронки. */
export function prepareArticlesForStage(
  articles: ProjectArticles,
  stage: ProjectStage,
): ProjectArticles {
  const aspect = financeAspectForStage(stage)
  if (!aspect) return articles
  return normalizeAspectZeroToNull(articles, aspect)
}
