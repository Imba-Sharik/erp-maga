import { ArrowRight, ChevronDown, CircleDollarSign, TrendingDown } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

import { useUserRole } from '@/entities/user-role'
import type { StageFormData } from '@/entities/project'
import {
  ARTICLE_LABELS,
  BACKLINE_ARTICLE_KINDS,
  MAIN_ARTICLE_KINDS,
  formatMoney,
  formatPercent,
  type ArticleBlock,
  type ArticleKind,
  type ArticleValues,
  type ProjectArticles,
} from '@/entities/project-articles'
import type { StageRecord } from '@/features/advance-stage'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { cn } from '@/shared/lib/utils'

import { canEditStage } from '../lib/stage-permissions'
import { MoneyInput } from './money-input'
import { StageField } from './stage-field'

type Source = 'manager' | 'system'
type Icon = ComponentType<SVGProps<SVGSVGElement>>

interface BonusRow {
  block: ArticleBlock
  kind: ArticleKind
  values: ArticleValues
}

function buildBonusRows(articles: ProjectArticles): BonusRow[] {
  const rows: BonusRow[] = []
  for (const kind of MAIN_ARTICLE_KINDS) {
    rows.push({ block: 'main', kind, values: articles.main[kind] })
  }
  if (articles.backline) {
    for (const kind of BACKLINE_ARTICLE_KINDS) {
      rows.push({ block: 'backline', kind, values: articles.backline[kind] })
    }
  }
  return rows
}

function calcRow(values: ArticleValues) {
  const netProfit = values.sales - values.expense
  const formulaBonus = (netProfit * values.bonusPercent) / 100
  // Если руководитель скорректировал — берём override, иначе формулу.
  const bonusAmount = values.bonusAmount ?? formulaBonus
  return { netProfit, bonusAmount }
}

function ReadonlyBox({
  value,
  source,
  className,
  align = 'left',
  icon: IconCmp,
}: {
  value: string
  source: Source
  className?: string
  align?: 'left' | 'center'
  icon?: Icon
}) {
  const isSystem = source === 'system'
  return (
    <div
      title={isSystem ? 'Заполнено системой' : undefined}
      className={cn(
        'flex h-9 items-center gap-2 rounded-[10px] border px-3 text-sm',
        align === 'center' ? 'justify-center' : 'justify-start',
        isSystem
          ? 'border-dashed border-[#C7C7C7] bg-[#F4F2EC] text-[#6B6B6B]'
          : 'border-[#B1B1B1] bg-[#FAFAFA] text-[#454545]',
        className,
      )}
    >
      {IconCmp ? <IconCmp className="size-4 shrink-0 text-[#6B6B6B]" /> : null}
      <span className="min-w-0 flex-1 truncate">{value}</span>
    </div>
  )
}

function Operator({ children }: { children: string }) {
  return <span className="px-1 text-sm font-medium text-[#6B6B6B]">{children}</span>
}

interface ArticleRowProps {
  row: BonusRow
  editable: boolean
  onBonusChange: (block: ArticleBlock, kind: ArticleKind, amount: number) => void
}

function ArticleRow({ row, editable, onBonusChange }: ArticleRowProps) {
  const { netProfit, bonusAmount } = calcRow(row.values)
  return (
    <div className="grid grid-cols-1 items-end gap-4 @[900px]:grid-cols-[minmax(0,1fr)_88px_120px]">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs font-medium text-[#454545]">{ARTICLE_LABELS[row.kind]}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          <ReadonlyBox
            value={formatMoney(row.values.sales)}
            source="system"
            icon={CircleDollarSign}
            className="min-w-0 flex-1"
          />
          <Operator>−</Operator>
          <ReadonlyBox
            value={formatMoney(row.values.expense)}
            source="system"
            icon={TrendingDown}
            className="min-w-0 flex-1"
          />
          <Operator>=</Operator>
          <ReadonlyBox value={formatMoney(netProfit)} source="system" className="min-w-0 flex-1" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#454545]">% Бонуса</span>
        <ReadonlyBox
          value={formatPercent(row.values.bonusPercent)}
          source="system"
          align="center"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#454545]">Бонус по статье</span>
        {editable ? (
          <MoneyInput
            value={bonusAmount}
            onCommit={(next) => onBonusChange(row.block, row.kind, next)}
          />
        ) : (
          <ReadonlyBox value={formatMoney(bonusAmount)} source="system" />
        )}
      </div>
    </div>
  )
}

interface StagePassedBonusProps {
  isCurrent?: boolean
  articles: ProjectArticles
  /** Запись этапа 9 (`data_confirmed`) — оттуда берём «Кто подтвердил». */
  dataConfirmedRecord?: StageRecord
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onAdvance?: (values?: Partial<StageFormData>) => void
}

export function StagePassedBonus({
  isCurrent = false,
  articles,
  dataConfirmedRecord,
  onArticleChange,
  onAdvance,
}: StagePassedBonusProps) {
  const role = useUserRole()
  const canEdit = canEditStage('bonus_calculated', role)
  const editable = canEdit && isCurrent

  const rows = buildBonusRows(articles)
  const totalBonus = rows.reduce((acc, row) => acc + calcRow(row.values).bonusAmount, 0)
  const dataConfirmedBy =
    (dataConfirmedRecord?.values?.dataConfirmedBy as string | undefined) ?? '—'

  const handleBonusChange = (block: ArticleBlock, kind: ArticleKind, amount: number) => {
    onArticleChange(block, kind, { bonusAmount: amount })
  }

  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex flex-col gap-5 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm">
            <span className="font-medium text-[#454545]">
              {isCurrent ? 'Текущий этап:' : 'Этап пройден:'}
            </span>
            <span className="text-funnel-closing font-semibold">Бонус рассчитан</span>
            <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
          </CollapsibleTrigger>
          {isCurrent && canEdit && (
            <Button
              type="button"
              onClick={() => onAdvance?.()}
              className="h-[38px] rounded-[10px] px-4 text-sm"
            >
              Следующий этап
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
        <CollapsibleContent className="flex flex-col gap-5">
          <div className="h-px w-full bg-[#F0F0F0]" />

          <Collapsible defaultOpen className="flex flex-col gap-4">
            <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm">
              <span className="font-medium text-[#454545]">
                Бонус: Продажная часть (основной блок)
              </span>
              <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-5 @[900px]:grid-cols-[minmax(0,1fr)_280px]">
                <div className="flex min-w-0 flex-col gap-4">
                  {rows.map((row) => (
                    <ArticleRow
                      key={`${row.block}-${row.kind}`}
                      row={row}
                      editable={editable}
                      onBonusChange={handleBonusChange}
                    />
                  ))}
                </div>
                <div className="flex flex-col justify-between gap-4 @[900px]:pl-5">
                  <StageField label="Данные подтверждены руководителем">
                    <ReadonlyBox value={dataConfirmedBy} source="system" />
                  </StageField>
                  <StageField label="Итоговый бонус">
                    <ReadonlyBox value={formatMoney(totalBonus)} source="system" />
                  </StageField>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
