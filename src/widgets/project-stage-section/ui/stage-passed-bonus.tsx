import { ChevronDown, CircleDollarSign, TrendingDown } from 'lucide-react'

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
import type { StagePresentationConfig } from '@/widgets/project-detail/lib/stage-presentation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'

import { canEditStage } from '../lib/stage-permissions'
import { MoneyInput } from './money-input'
import { StageBlockShell } from './stage-block-shell'
import { StageField } from './stage-field'
import { StageMobileDashDivider } from './stage-mobile-dash-divider'
import { StageReadonlyBox } from './stage-readonly-box'

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
  const netProfit = (values.sales ?? 0) - (values.expense ?? 0)
  const formulaBonus = (netProfit * values.bonusPercent) / 100
  // Если руководитель скорректировал — берём override, иначе формулу.
  const bonusAmount = values.bonusAmount ?? formulaBonus
  return { netProfit, bonusAmount }
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
    <div className="grid grid-cols-2 items-end gap-4 @[900px]:grid-cols-[minmax(0,1fr)_88px_120px]">
      <div className="col-span-2 flex min-w-0 flex-col gap-1.5 @[900px]:col-span-1">
        <span className="text-xs font-medium text-[#454545]">{ARTICLE_LABELS[row.kind]}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          <StageReadonlyBox
            value={row.values.sales === null ? '—' : formatMoney(row.values.sales)}
            source="system"
            icon={CircleDollarSign}
            className="min-w-0 flex-1"
          />
          <Operator>−</Operator>
          <StageReadonlyBox
            value={row.values.expense === null ? '—' : formatMoney(row.values.expense)}
            source="system"
            icon={TrendingDown}
            className="min-w-0 flex-1"
          />
          <Operator>=</Operator>
          <StageReadonlyBox
            value={formatMoney(netProfit)}
            source="system"
            className="min-w-0 flex-1"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#454545]">% Бонуса</span>
        <StageReadonlyBox
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
            onCommit={(next) => onBonusChange(row.block, row.kind, next ?? 0)}
          />
        ) : (
          <StageReadonlyBox value={formatMoney(bonusAmount)} source="system" />
        )}
      </div>
    </div>
  )
}

interface StagePassedBonusProps {
  presentation: StagePresentationConfig
  isCurrent?: boolean
  articles: ProjectArticles
  /** Запись этапа 9 (`data_confirmed`) — оттуда берём «Кто подтвердил». */
  dataConfirmedRecord?: StageRecord
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onAdvance?: (values?: Partial<StageFormData>) => void
  hasDraftHighlight?: boolean
}

export function StagePassedBonus({
  presentation,
  isCurrent = false,
  articles,
  dataConfirmedRecord,
  onArticleChange,
  onAdvance,
  hasDraftHighlight,
}: StagePassedBonusProps) {
  const role = useUserRole()
  const canEdit = canEditStage('bonus_calculated', role)
  const editable = !presentation.readOnly && canEdit && isCurrent

  const rows = buildBonusRows(articles)
  const mainRows = rows.filter((row) => row.block === 'main')
  const backlineRows = rows.filter((row) => row.block === 'backline')
  const totalBonus = rows.reduce((acc, row) => acc + calcRow(row.values).bonusAmount, 0)
  const dataConfirmedBy =
    (dataConfirmedRecord?.values?.dataConfirmedBy as string | undefined) ??
    dataConfirmedRecord?.completedBy ??
    dataConfirmedRecord?.enteredBy ??
    '—'

  const handleBonusChange = (block: ArticleBlock, kind: ArticleKind, amount: number) => {
    onArticleChange(block, kind, { bonusAmount: amount })
  }

  return (
    <StageBlockShell
      shell={{
        showStageHeader: presentation.showStageHeader,
        stageCollapsible: presentation.stageCollapsible,
        showAdvanceButton: presentation.showAdvanceButton,
      }}
      isCurrent={isCurrent}
      canShowAdvance={canEdit}
      headerTitle="Бонус рассчитан"
      headerColorClass="text-funnel-closing"
      hasDraftHighlight={hasDraftHighlight}
      onAdvance={() => onAdvance?.()}
    >
      <Collapsible defaultOpen className="flex flex-col">
        <CollapsibleTrigger className="group flex items-center gap-1.5 text-start text-sm">
          <span className="font-medium text-[#454545]">Бонус: Продажная часть (основной блок)</span>
          <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 gap-5 @[900px]:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex min-w-0 flex-col gap-4">
              {mainRows.flatMap((row, idx) => {
                const showDivider = idx < mainRows.length - 1 || backlineRows.length > 0
                return [
                  <ArticleRow
                    key={`${row.block}-${row.kind}`}
                    row={row}
                    editable={editable}
                    onBonusChange={handleBonusChange}
                  />,
                  showDivider ? (
                    <StageMobileDashDivider key={`div-main-${idx}`} hideFrom="900" />
                  ) : null,
                ]
              })}
              {backlineRows.flatMap((row, idx) => {
                const showDivider = idx < backlineRows.length - 1
                return [
                  <ArticleRow
                    key={`${row.block}-${row.kind}`}
                    row={row}
                    editable={editable}
                    onBonusChange={handleBonusChange}
                  />,
                  showDivider ? (
                    <StageMobileDashDivider key={`div-backline-${idx}`} hideFrom="900" />
                  ) : null,
                ]
              })}
              <StageMobileDashDivider hideFrom="900" />
            </div>
            <div className="flex flex-col justify-between gap-4 @[900px]:pl-5">
              <StageField label="Данные подтверждены руководителем">
                <StageReadonlyBox value={dataConfirmedBy} source="system" />
              </StageField>
              <StageField label="Итоговый бонус">
                <StageReadonlyBox value={formatMoney(totalBonus)} source="system" />
              </StageField>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </StageBlockShell>
  )
}
