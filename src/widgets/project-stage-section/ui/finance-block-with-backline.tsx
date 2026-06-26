import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import {
  ARTICLE_LABELS,
  areFinanceAspectFieldsFilled,
  blockTotal,
  formatMoney,
  formatPercent,
  projectTotal,
  taxAmount,
  type ArticleBlock,
  type ArticleKind,
  type ArticleValues,
  type FinanceAspect,
  type ProjectArticles,
} from '@/entities/project-article'
import type { ProjectDetail, ProjectStage } from '@/entities/project'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'
import { RollbackStageButton } from '@/features/rollback-stage'
import type { StagePresentationConfig } from '@/shared/lib/stage-presentation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { Input } from '@/shared/ui/input'

import { canEditStage } from '../lib/stage-permissions'
import { FinanceArticlesGrid } from './finance-articles-grid'
import { MoneyInput } from './money-input'
import { StageBlockShell } from './stage-block-shell'
import { StageField } from './stage-field'
import { StageReadonlyBox, type StageReadonlySource } from './stage-readonly-box'

type Aspect = FinanceAspect

const REQUIRED_FIELD_MESSAGE = 'Обязательное поле'

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

function percentToDraft(value: number | null): string {
  if (value === null) return ''
  return String(value).replace('.', ',')
}

function sanitizePercentInput(input: string): string {
  return input.replace(/[^\d.,]/g, '')
}

function parsePercentDraft(draft: string): number | null {
  const cleaned = sanitizePercentInput(draft).replace(',', '.')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  return Math.min(100, n)
}

function PercentInput({
  value,
  onCommit,
  invalid = false,
}: {
  value: number | null
  onCommit: (next: number | null) => void
  invalid?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(() => percentToDraft(value))

  useEffect(() => {
    if (!focused) setDraft(percentToDraft(value))
  }, [value, focused])

  const display = focused ? draft : value === null ? '' : formatPercent(value)

  return (
    <Input
      inputMode="decimal"
      value={display}
      placeholder="Введите %"
      aria-invalid={invalid}
      onFocus={() => {
        setFocused(true)
        setDraft(percentToDraft(value))
      }}
      onBlur={() => {
        setFocused(false)
        onCommit(parsePercentDraft(draft))
      }}
      onChange={(e) => setDraft(sanitizePercentInput(e.target.value))}
      className="border-border-strong h-9 rounded-[10px] bg-white text-sm"
    />
  )
}

interface ArticleRowProps {
  kind: ArticleKind
  values: ArticleValues
  aspect: Aspect
  editable: boolean
  showValidation: boolean
  onChange: (patch: Partial<ArticleValues>) => void
}

// % бонуса намеренно не показываем на этапах sales/expense — он считается,
// но визуально живёт только на этапе «Бонус рассчитан» (StagePassedBonus).
function ArticleRow({ kind, values, aspect, editable, showValidation, onChange }: ArticleRowProps) {
  const isEmpty = values[aspect] === null
  const fieldError = showValidation && isEmpty ? REQUIRED_FIELD_MESSAGE : undefined

  return (
    <StageField label={ARTICLE_LABELS[kind]} required error={fieldError}>
      {editable ? (
        <MoneyInput
          value={values[aspect]}
          invalid={Boolean(fieldError)}
          onCommit={(n) => onChange({ [aspect]: n } as Partial<ArticleValues>)}
        />
      ) : (
        <StageReadonlyBox
          value={values[aspect] === null ? '—' : formatMoney(values[aspect])}
          source="system"
        />
      )}
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
      <span className="text-foreground-soft font-medium">{title}</span>
      <ChevronDown className="text-muted-foreground size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
    </CollapsibleTrigger>
  )
}

interface FinanceBlockWithBacklineProps {
  presentation: StagePresentationConfig
  project: ProjectDetail
  stage: ProjectStage
  headerTitle: string
  headerColorClass: string
  aspect: Aspect
  subsectionTitlePrefix?: string
  isCurrent?: boolean
  record?: StageRecord
  articles: ProjectArticles
  taxRate: number | null
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number | null) => void
  onToggleBackline: () => void
  onAdvance?: () => void
  isAdvancing?: boolean
  hasDraftHighlight?: boolean
  /** Дополнительные блоки в секции «Информация» (перед статусом перевода). */
  infoExtras?: ReactNode
}

export function FinanceBlockWithBackline({
  presentation,
  project,
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
  isAdvancing,
  hasDraftHighlight,
  infoExtras,
}: FinanceBlockWithBacklineProps) {
  const role = useUserRole()
  const canEdit = canEditStage(stage, role)
  const editable = !presentation.readOnly && canEdit && isCurrent
  const backlineAdded = articles.backline !== null

  const totalSales = projectTotal(articles, 'sales')
  const tax = taxAmount(totalSales, taxRate ?? 0)
  const mainTotal = blockTotal(articles, 'main', aspect)
  const backlineTotal = blockTotal(articles, 'backline', aspect)

  // Процент налога вводится вручную только на ready_to_event (продажная воронка).
  const taxRequired = aspect === 'sales'
  const taxValid = !taxRequired || taxRate !== null

  const [showValidation, setShowValidation] = useState(false)

  const taxError =
    showValidation && taxRequired && taxRate === null ? REQUIRED_FIELD_MESSAGE : undefined

  const handleAdvance = useCallback(() => {
    if (areFinanceAspectFieldsFilled(articles, aspect) && taxValid) {
      setShowValidation(false)
      onAdvance?.()
      return
    }
    setShowValidation(true)
  }, [articles, aspect, taxValid, onAdvance])

  const renderArticleRow = (block: ArticleBlock, kind: ArticleKind) => {
    const values = articles[block]?.[kind] ?? { sales: null, expense: null, bonusPercent: 0 }
    return (
      <ArticleRow
        key={`${block}-${kind}`}
        kind={kind}
        values={values}
        aspect={aspect}
        editable={editable}
        showValidation={showValidation}
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
      canShowAdvance={canEdit}
      headerTitle={headerTitle}
      headerColorClass={headerColorClass}
      hasDraftHighlight={hasDraftHighlight}
      onAdvance={handleAdvance}
      isAdvancing={isAdvancing}
      headerActions={
        isCurrent ? (
          <RollbackStageButton project={project} readOnly={presentation.readOnly} />
        ) : undefined
      }
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
                <StageField key="tax-rate" label="Единый % налога" required error={taxError}>
                  {editable ? (
                    <PercentInput
                      value={taxRate}
                      invalid={Boolean(taxError)}
                      onCommit={onTaxRateChange}
                    />
                  ) : (
                    <StageReadonlyBox
                      value={taxRate === null ? '—' : formatPercent(taxRate)}
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
                        className="text-funnel-preproject border-funnel-preproject hover:bg-funnel-preproject/15 bg-info-surface inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 self-start rounded-[10px] border px-3 text-sm font-medium"
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
          <span className="text-foreground-soft text-sm font-medium">Информация</span>
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
          className="border-border-strong h-9 rounded-[10px] bg-white text-sm"
        />
      ) : (
        <StageReadonlyBox value={comment || '—'} source="system" />
      )}
    </StageField>
  )
}
