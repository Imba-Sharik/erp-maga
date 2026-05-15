import { FinanceBlockWithBackline } from './finance-block-with-backline'

export function StagePassedReady() {
  return (
    <FinanceBlockWithBackline
      stage="ready"
      headerTitle="Готов к проведению"
      headerColorClass="text-funnel-preproject"
    />
  )
}
