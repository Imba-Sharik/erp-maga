import type {
  ArticleBlock,
  ArticleKind,
  ArticleValues,
  ProjectArticles,
} from '@/entities/project-article'
import type { StageRecord } from '@/features/advance-stage'
import type { StagePresentationConfig } from '@/widgets/project-detail/lib/stage-presentation'

import { FinanceBlockWithBackline } from './finance-block-with-backline'

interface StagePassedReadyProps {
  presentation: StagePresentationConfig
  isCurrent?: boolean
  record?: StageRecord
  hasDraftHighlight?: boolean
  articles: ProjectArticles
  taxRate: number | null
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number | null) => void
  onToggleBackline: () => void
  onAdvance?: () => void
}

export function StagePassedReady({ presentation, ...props }: StagePassedReadyProps) {
  return (
    <FinanceBlockWithBackline
      presentation={presentation}
      stage="ready_to_event"
      headerTitle="Готов к проведению"
      headerColorClass="text-funnel-preproject"
      aspect="sales"
      {...props}
    />
  )
}
