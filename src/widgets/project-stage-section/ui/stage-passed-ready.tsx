import type { ProjectDetail } from '@/entities/project'
import type {
  ArticleBlock,
  ArticleKind,
  ArticleValues,
  ProjectArticles,
} from '@/entities/project-article'
import type { StageRecord } from '@/features/advance-stage'
import type { StagePresentationConfig } from '@/shared/lib/stage-presentation'

import { FinanceBlockWithBackline } from './finance-block-with-backline'

interface StagePassedReadyProps {
  presentation: StagePresentationConfig
  project: ProjectDetail
  isCurrent?: boolean
  record?: StageRecord
  hasDraftHighlight?: boolean
  articles: ProjectArticles
  taxRate: number | null
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number | null) => void
  onToggleBackline: () => void
  onAdvance?: () => void
  isAdvancing?: boolean
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
