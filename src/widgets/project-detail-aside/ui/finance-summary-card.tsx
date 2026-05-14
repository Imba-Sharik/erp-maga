import { KvRow, ProjectAsideCard, type ProjectDetail } from '@/entities/project'

const RUB_FORMAT = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

function formatMoney(value: number | null) {
  if (value === null) return '—'
  return RUB_FORMAT.format(value)
}

export function FinanceSummaryCard({ project }: { project: ProjectDetail }) {
  const { sales, expenses, bonuses, netProfit } = project.finance
  const muted = 'text-muted-foreground'

  return (
    <ProjectAsideCard title="Финансы (сводка)">
      <KvRow label="Продажи" value={formatMoney(sales)} />
      <KvRow
        label={<span className={muted}>Расходы</span>}
        value={formatMoney(expenses)}
        valueClassName={expenses === null ? muted : undefined}
      />
      <KvRow
        label={<span className={muted}>Бонусы</span>}
        value={formatMoney(bonuses)}
        valueClassName={bonuses === null ? muted : undefined}
      />
      <KvRow
        label={<span className={muted}>Чистая прибыль</span>}
        value={formatMoney(netProfit)}
        valueClassName={netProfit === null ? muted : undefined}
      />
    </ProjectAsideCard>
  )
}
