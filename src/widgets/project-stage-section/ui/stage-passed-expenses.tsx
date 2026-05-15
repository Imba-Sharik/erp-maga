import { useUserRole } from '@/entities/user-role'

import { canEditStage } from '../lib/stage-permissions'
import {
  ExpensesCommentField,
  FinanceBlockWithBackline,
} from './finance-block-with-backline'

export function StagePassedExpenses() {
  const role = useUserRole()
  const canEdit = canEditStage('expenses_entered', role)

  return (
    <FinanceBlockWithBackline
      stage="expenses_entered"
      headerTitle="Расходы внесены"
      headerColorClass="text-funnel-closing"
      subsectionTitlePrefix="Расходы: "
      infoExtras={<ExpensesCommentField canEdit={canEdit} />}
    />
  )
}
