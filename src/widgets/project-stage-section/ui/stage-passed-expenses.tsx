import type {
  ArticleBlock,
  ArticleKind,
  ArticleValues,
  ProjectArticles,
} from '@/entities/project-article'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'
import type { StagePresentationConfig } from '@/shared/lib/stage-presentation'

import { canEditStage } from '../lib/stage-permissions'
import { ExpensesCommentField, FinanceBlockWithBackline } from './finance-block-with-backline'

interface StagePassedExpensesProps {
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

export function StagePassedExpenses({
  presentation,
  isCurrent,
  ...rest
}: StagePassedExpensesProps) {
  const role = useUserRole()
  const canEdit = canEditStage('expenses_entered', role)
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
