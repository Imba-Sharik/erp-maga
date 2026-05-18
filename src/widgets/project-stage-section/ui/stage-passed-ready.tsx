import type { ArticleBlock, ArticleKind, ArticleValues, ProjectArticles } from '@/entities/project-articles'
import type { StageRecord } from '@/features/advance-stage'

import { FinanceBlockWithBackline } from './finance-block-with-backline'

interface StagePassedReadyProps {
  isCurrent?: boolean
  record?: StageRecord
  articles: ProjectArticles
  taxRate: number
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number) => void
  onToggleBackline: () => void
  onAdvance?: () => void
}

export function StagePassedReady(props: StagePassedReadyProps) {
  return (
    <FinanceBlockWithBackline
      stage="ready"
      headerTitle="Готов к проведению"
      headerColorClass="text-funnel-preproject"
      aspect="sales"
      {...props}
    />
  )
}
