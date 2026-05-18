import type { ArticleBlock, ArticleKind, ArticleValues, ProjectArticles } from '@/entities/project-articles'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'

import { canEditStage } from '../lib/stage-permissions'
import {
  ExpensesCommentField,
  FinanceBlockWithBackline,
} from './finance-block-with-backline'

interface StagePassedExpensesProps {
  isCurrent?: boolean
  record?: StageRecord
  articles: ProjectArticles
  taxRate: number
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number) => void
  onToggleBackline: () => void
  onAdvance?: () => void
}

export function StagePassedExpenses({ isCurrent, ...rest }: StagePassedExpensesProps) {
  const role = useUserRole()
  const canEdit = canEditStage('expenses_entered', role)

  return (
    <FinanceBlockWithBackline
      stage="expenses_entered"
      headerTitle="Расходы внесены"
      headerColorClass="text-funnel-closing"
      aspect="expense"
      subsectionTitlePrefix="Расходы: "
      isCurrent={isCurrent}
      infoExtras={<ExpensesCommentField canEdit={canEdit && Boolean(isCurrent)} />}
      {...rest}
    />
  )
}
