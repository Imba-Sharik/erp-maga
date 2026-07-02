import type { ProjectDetail } from '@/entities/project'
import type {
  ArticleBlock,
  ArticleKind,
  ArticleValues,
  ProjectArticles,
} from '@/entities/project-article'
import { canEditCurrentStage } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'
import type { StagePresentationConfig } from '@/shared/lib/stage-presentation'

import { ExpensesCommentField, FinanceBlockWithBackline } from './finance-block-with-backline'

interface StagePassedExpensesProps {
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
  onAddBackline: () => Promise<void>
  onRemoveBackline: () => Promise<void>
  onAdvance?: () => void
  isAdvancing?: boolean
  onSavePassed?: () => void
  onReplaceArticles?: (next: ProjectArticles) => void
}

export function StagePassedExpenses({
  presentation,
  isCurrent,
  ...rest
}: StagePassedExpensesProps) {
  const role = useUserRole()
  const canEdit = canEditCurrentStage('expenses_entered', role)
  const commentEditable = !presentation.readOnly && canEdit && Boolean(isCurrent)

  return (
    <FinanceBlockWithBackline
      presentation={presentation}
      stage="expenses_entered"
      headerTitle="Расходы внесены"
      headerColorClass="text-funnel-closing"
      aspect="expense"
      subsectionTitlePrefix="Расходы: "
      isCurrent={isCurrent}
      infoExtras={<ExpensesCommentField canEdit={commentEditable} />}
      {...rest}
    />
  )
}
