import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import {
  ARTICLE_LABELS,
  areFinanceAspectFieldsFilled,
  blockTotal,
  formatMoney,
  formatPercent,
  parsePercent,
  projectTotal,
  taxAmount,
  type ArticleBlock,
  type ArticleKind,
  type ArticleValues,
  type ProjectArticles,
} from '@/entities/project-articles'
import type { ProjectStage } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'
import type { StagePresentationConfig } from '@/widgets/project-detail/lib/stage-presentation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { Input } from '@/shared/ui/input'

import { canEditStage } from '../lib/stage-permissions'
import { FinanceArticlesGrid } from './finance-articles-grid'
import { MoneyInput } from './money-input'
import { StageBlockShell } from './stage-block-shell'
import { StageField } from './stage-field'
import { StageReadonlyBox, type StageReadonlySource } from './stage-readonly-box'

type Aspect = 'sales' | 'expense'

const MAIN_LEFT: ArticleKind[] = ['equipment', 'personnel', 'sublease', 'transport']
const MAIN_RIGHT: ArticleKind[] = ['internet', 'consumables', 'screen', 'tm']
const BACKLINE_LEFT: ArticleKind[] = ['equipment', 'personnel', 'sublease']
const BACKLINE_RIGHT: ArticleKind[] = ['transport', 'consumables', 'tm']

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatRecordDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return DATE_FORMAT.format(d)
}

function PercentInput({ value, onCommit }: { value: number; onCommit: (next: number) => void }) {
  // Незаполненное значение — это явный «0%» в поле, чтобы было видно, что налог будет 0.
  const display = formatPercent(value)
  return (
    <Input
      inputMode="decimal"
      value={display}
      placeholder="0%"
      onChange={(e) => onCommit(Math.min(100, parsePercent(e.target.value)))}
      className="h-9 rounded-[10px] border-[#B1B1B1] bg-white text-sm"
    />
  )
}

interface ArticleRowProps {
  kind: ArticleKind
  values: ArticleValues
  percent: number
  aspect: Aspect
  editable: boolean
  onChange: (patch: Partial<ArticleValues>) => void
}

function ArticleRow({ kind, values, percent, aspect, editable, onChange }: ArticleRowProps) {
  const required = true
  return (
    <StageField label={ARTICLE_LABELS[kind]} required={required}>
      <div className="grid grid-cols-[1fr_56px] gap-1.5">
        {editable ? (
          <MoneyInput
            value={values[aspect]}
            onCommit={(n) => onChange({ [aspect]: n } as Partial<ArticleValues>)}
          />
        ) : (
          <StageReadonlyBox
            value={values[aspect] === null ? '—' : formatMoney(values[aspect])}
            source="system"
          />
        )}
        <StageReadonlyBox value={formatPercent(percent)} source="system" align="center" />
      </div>
    </StageField>
  )
}

function SimpleField({
  label,
  value,
  source = 'manager',
  required,
  children,
}: {
  label: string
  value?: string
  source?: StageReadonlySource
  required?: boolean
  children?: ReactNode
}) {
  return (
    <StageField label={label} required={required}>
      {children ?? <StageReadonlyBox value={value ?? ''} source={source} />}
    </StageField>
  )
}

function DualField({
  a,
  b,
}: {
  a: { label: string; value: string }
  b: { label: string; value: string }
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SimpleField label={a.label} value={a.value} source="system" />
      <SimpleField label={b.label} value={b.value} source="system" />
    </div>
  )
}

function ActionField({ children }: { children: ReactNode }) {
  return <StageField label="Действие">{children}</StageField>
}

function SubsectionHeader({ title }: { title: string }) {
  return (
    <CollapsibleTrigger className="group flex items-center gap-1.5 text-start text-sm">
      <span className="font-medium text-[#454545]">{title}</span>
      <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
    </CollapsibleTrigger>
  )
}

interface FinanceBlockWithBacklineProps {
  presentation: StagePresentationConfig
  stage: ProjectStage
  headerTitle: string
  headerColorClass: string
  aspect: Aspect
  subsectionTitlePrefix?: string
  isCurrent?: boolean
  record?: StageRecord
  articles: ProjectArticles
  taxRate: number
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number) => void
  onToggleBackline: () => void
  onAdvance?: () => void
  hasDraftHighlight?: boolean
  /** Дополнительные блоки в секции «Информация» (перед статусом перевода). */
  infoExtras?: ReactNode
}

export function FinanceBlockWithBackline({
  presentation,
  stage,
  headerTitle,
  headerColorClass,
  aspect,
  subsectionTitlePrefix = '',
  isCurrent = false,
  record,
  articles,
  taxRate,
  onArticleChange,
  onTaxRateChange,
  onToggleBackline,
  onAdvance,
  hasDraftHighlight,
  infoExtras,
}: FinanceBlockWithBacklineProps) {
  const role = useUserRole()
  const canEdit = canEditStage(stage, role)
  const editable = !presentation.readOnly && canEdit && isCurrent
  const backlineAdded = articles.backline !== null

  const totalSales = projectTotal(articles, 'sales')
  const tax = taxAmount(totalSales, taxRate)
  const mainTotal = blockTotal(articles, 'main', aspect)
  const backlineTotal = blockTotal(articles, 'backline', aspect)

  const financeComplete = areFinanceAspectFieldsFilled(articles, aspect)

  const renderArticleRow = (block: ArticleBlock, kind: ArticleKind) => {
    const values = articles[block]?.[kind] ?? { sales: null, expense: null, bonusPercent: 0 }
    return (
      <ArticleRow
        key={`${block}-${kind}`}
        kind={kind}
        values={values}
        percent={values.bonusPercent}
        aspect={aspect}
        editable={editable}
        onChange={(patch) => onArticleChange(block, kind, patch)}
      />
    )
  }

  return (
    <StageBlockShell
      shell={{
        showStageHeader: presentation.showStageHeader,
        stageCollapsible: presentation.stageCollapsible,
        showAdvanceButton: presentation.showAdvanceButton,
      }}
      isCurrent={isCurrent}
      canShowAdvance={canEdit && financeComplete}
      headerTitle={headerTitle}
      headerColorClass={headerColorClass}
      hasDraftHighlight={hasDraftHighlight}
      onAdvance={onAdvance}
    >
      <div className="flex flex-col gap-5">
        <Collapsible defaultOpen className="flex flex-col">
          <SubsectionHeader title={`${subsectionTitlePrefix}Продажная часть (основной блок)`} />
          <CollapsibleContent className="pt-4">
            <FinanceArticlesGrid
              idPrefix="main"
              left={MAIN_LEFT}
              right={MAIN_RIGHT}
              renderArticle={(kind) => renderArticleRow('main', kind)}
              summary={[
                <StageField key="tax-rate" label="Единый % налога" required>
                  {editable ? (
                    <PercentInput value={taxRate} onCommit={onTaxRateChange} />
                  ) : (
                    <StageReadonlyBox
                      value={taxRate > 0 ? formatPercent(taxRate) : '—'}
                      source="manager"
                    />
                  )}
                </StageField>,
                <SimpleField
                  key="tax-amount"
                  label="Сумма налога"
                  value={formatMoney(tax)}
                  source="system"
                />,
                <DualField
                  key="totals"
                  a={{ label: 'Итого', value: formatMoney(mainTotal) }}
                  b={{
                    label: 'Итого с налогом',
                    value: formatMoney(mainTotal + tax),
                  }}
                />,
                editable ? (
                  <ActionField key="action">
                    {backlineAdded ? (
                      <button
                        type="button"
                        disabled
                        className="text-funnel-closing border-funnel-closing/40 bg-funnel-closing/10 inline-flex h-9 w-fit cursor-not-allowed items-center gap-1.5 self-start rounded-[10px] border px-3 text-sm font-medium"
                      >
                        <Plus className="size-3.5 rotate-45" />
                        Бэклайн добавлен
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onToggleBackline}
                        className="text-funnel-preproject border-funnel-preproject hover:bg-funnel-preproject/15 inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 self-start rounded-[10px] border bg-[#E9ECFF] px-3 text-sm font-medium"
                      >
                        <Plus className="size-3.5" />
                        Добавить бэклайн
                      </button>
                    )}
                  </ActionField>
                ) : null,
              ]}
            />
          </CollapsibleContent>
        </Collapsible>

        {backlineAdded && (
          <Collapsible defaultOpen className="flex flex-col">
            <SubsectionHeader title={`${subsectionTitlePrefix}Бэклайн (дополнительный блок)`} />
            <CollapsibleContent className="pt-4">
              <FinanceArticlesGrid
                idPrefix="backline"
                left={BACKLINE_LEFT}
                right={BACKLINE_RIGHT}
                renderArticle={(kind) => renderArticleRow('backline', kind)}
                summary={[
                  <SimpleField
                    key="bl-total"
                    label="Итого бэклайн"
                    value={formatMoney(backlineTotal)}
                    source="system"
                  />,
                  editable ? (
                    <ActionField key="bl-action">
                      <button
                        type="button"
                        onClick={onToggleBackline}
                        className="inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 self-start rounded-[10px] border border-red-300 bg-white px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Удалить бэклайн
                      </button>
                    </ActionField>
                  ) : null,
                ]}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex flex-col gap-4">
          <span className="text-sm font-medium text-[#454545]">Информация</span>
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
            {infoExtras}
            <SimpleField
              label="Статус перевёл менеджер"
              value={record?.enteredBy ?? '—'}
              source="system"
            />
            <SimpleField
              label="Дата перехода в статус"
              value={formatRecordDate(record?.enteredAt) ?? '—'}
              source="system"
            />
          </div>
        </div>
      </div>
    </StageBlockShell>
  )
}

export function ExpensesCommentField({ canEdit }: { canEdit: boolean }) {
  const [comment, setComment] = useState('')
  return (
    <StageField label="Комментарий к расходам">
      {canEdit ? (
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="—"
          className="h-9 rounded-[10px] border-[#B1B1B1] bg-white text-sm"
        />
      ) : (
        <StageReadonlyBox value={comment || '—'} source="system" />
      )}
    </StageField>
  )
}
