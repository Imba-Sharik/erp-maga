import { ArrowRight, Pencil } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib/utils'

import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent } from '@/shared/ui/collapsible'
import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  contactChannelLabels,
  contractTypeLabels,
  type DocumentStatus,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import type { ProjectArticles } from '@/entities/project-articles'
import { stageBlockBorderClass } from '@/entities/stage-draft'
import {
  STATUS_CONFIRM_META_BY_STATUS,
  DOC_PAIR_BY_STATUS_FIELD,
} from '@/entities/project-documents'

import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'

import {
  confirmedAtLabelForDocStatus,
  statusFieldForConfirmedAt,
  FILE_NAME_TO_STATUS_FIELD,
  getStageDocumentFieldVariant,
} from '../lib/document-status-fields'
import {
  filterDocumentsConfirmedGridFields,
  isDocumentStatusField,
} from '../lib/documents-confirmed-layout'
import {
  filterStageFields,
  PASSED_EXTRAS,
  STAGE_FIELDS,
  type StageFieldConfig,
} from '../lib/fields-map'
import { getReadonlyFieldSource } from '../lib/readonly-field-source'
import { renderNarrowPairs } from '../lib/render-narrow-pairs'
import { renderDocumentsConfirmedGrid } from '../lib/render-documents-confirmed-grid'
import { resolveSystemValue } from '../lib/resolve-system-value'
import { canAdvanceStage, canEditField, canEditStage } from '../lib/stage-permissions'
import { StageDocumentField } from '@/features/stage-document'
import { StageEstimateField } from './stage-estimate-field'
import { StageFieldDemoEditable } from './stage-field-demo-editable'
import { StageFieldLabel } from './stage-field-label'
import { StageFieldReadonly } from './stage-field-readonly'
import { StageSectionCurrent } from './stage-section-current'
import { StageStatusHeader } from './stage-status-header'

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(value: string | undefined) {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return DATE_FORMAT.format(d)
}

interface ResolveCtx {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
}

function fallbackValue(
  ctx: ResolveCtx,
  values: Partial<StageFormData> | undefined,
  f: StageFieldConfig,
): string | undefined {
  const fromValues = (values as Record<string, string | undefined> | undefined)?.[f.name]
  if (fromValues) return fromValues
  if (f.source === 'system') return resolveSystemValue(f.name, f.mockValue, ctx)
  // Manager-поле не заполнено менеджером — показываем пусто, без подсказочного mockValue.
  return undefined
}

function readField(
  ctx: ResolveCtx,
  values: Partial<StageFormData> | undefined,
  f: StageFieldConfig,
): string | undefined {
  const raw = fallbackValue(ctx, values, f)
  if (!raw) return undefined

  if (f.type === 'date') return formatDate(raw)
  if (f.type === 'document') return raw
  if (f.type === 'select') {
    if (f.options) return f.options.find((o) => o.value === raw)?.label ?? raw
    if (f.name === 'contactChannel')
      return contactChannelLabels[raw as keyof typeof contactChannelLabels] ?? raw
    if (f.name === 'contractType')
      return contractTypeLabels[raw as keyof typeof contractTypeLabels] ?? raw
  }
  return raw
}

function spanClass(span: 1 | 2 | 3 | undefined, isMultiline: boolean) {
  if (span === 3) return '@[640px]:col-span-3'
  if (span === 2) return '@[640px]:col-span-2'
  if (isMultiline) return '@[640px]:row-span-2'
  return undefined
}

interface StageSectionPassedProps {
  project: ProjectDetail
  stage: ProjectStage
  isCurrent?: boolean
  record?: StageRecord
  articles?: ProjectArticles
  onAdvance?: (values?: Partial<StageFormData>) => void
  /**
   * Если задан — на пройденной секции появляется кнопка «Редактировать», по
   * клику показывается RHF-форма этапа в режиме edit. Save вызывает этот колбэк.
   */
  onEditPassed?: (values: Partial<StageFormData>) => void
  hasDraftHighlight?: boolean
}

export function StageSectionPassed({
  project,
  stage,
  isCurrent = false,
  record,
  articles,
  onAdvance,
  onEditPassed,
  hasDraftHighlight,
}: StageSectionPassedProps) {
  const ctx: ResolveCtx = { project, stage, record, articles }
  const values = record?.values
  const role = useUserRole()
  const allFields = STAGE_FIELDS[stage]
  const visibleFields = useMemo(
    () => filterStageFields(allFields, role, 'passed'),
    [allFields, role],
  )
  const gridFields = useMemo(
    () => filterDocumentsConfirmedGridFields(visibleFields, stage, role),
    [visibleFields, stage, role],
  )
  const extras = PASSED_EXTRAS[stage]
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  const canEdit = canEditStage(stage, role)
  const canAdvance = canAdvanceStage(stage, role)
  const [editing, setEditing] = useState(false)

  if (editing && onEditPassed) {
    return (
      <StageSectionCurrent
        project={project}
        stage={stage}
        record={record}
        articles={articles}
        editingMode="edit"
        onEditingSubmit={(next) => {
          onEditPassed(next)
          setEditing(false)
        }}
        onCancelEditing={() => setEditing(false)}
      />
    )
  }

  const showEditButton = !isCurrent && canEdit && Boolean(onEditPassed)

  const renderField = (f: StageFieldConfig) => {
    const fieldEditable = canEditField(stage, role, f)

    if (f.type === 'estimate') {
      const fileName = readField(ctx, values, f) ?? ''
      return (
        <div key={f.name} className={cn('flex min-w-0 flex-col gap-1.5', spanClass(f.span, false))}>
          <StageFieldLabel label={f.label} />
          <StageEstimateField value={fileName} interaction="download" />
        </div>
      )
    }

    if (f.type === 'document' && f.documentType) {
      const fileName = readField(ctx, values, f) ?? ''
      const statusField =
        f.name in FILE_NAME_TO_STATUS_FIELD
          ? FILE_NAME_TO_STATUS_FIELD[f.name as keyof typeof FILE_NAME_TO_STATUS_FIELD]
          : undefined
      const status = statusField ? (values?.[statusField] as DocumentStatus | undefined) : undefined

      return (
        <div key={f.name} className={cn('flex min-w-0 flex-col gap-1.5', spanClass(f.span, false))}>
          <StageFieldLabel label={f.label} />
          <StageDocumentField
            projectId={project.id}
            documentType={f.documentType}
            value={fileName}
            variant={getStageDocumentFieldVariant(fileName || undefined, status, {
              uploadedAt: project.documentFiles?.[f.documentType]?.uploadedAt,
              confirmedAt: statusField
                ? (values?.[STATUS_CONFIRM_META_BY_STATUS[statusField]?.atField] as
                    | string
                    | undefined)
                : undefined,
              reuploadedAt: project.documentFiles?.[f.documentType]?.reuploadedAt,
            })}
            interaction="download"
          />
        </div>
      )
    }

    if (f.source === 'manager' && f.type !== 'document' && fieldEditable && isCurrent) {
      return (
        <StageFieldDemoEditable
          key={f.name}
          field={f}
          initialValue={fallbackValue(ctx, values, f)}
          className={spanClass(f.span, f.type === 'textarea')}
        />
      )
    }

    const statusForLabelField = statusFieldForConfirmedAt(f.name)
    const readonlyLabel =
      statusForLabelField != null
        ? confirmedAtLabelForDocStatus(
            values?.[statusForLabelField] as DocumentStatus | undefined,
            f.label,
          )
        : f.label

    if (
      stage === 'documents_confirmed' &&
      role === 'accountant' &&
      f.type === 'select' &&
      isDocumentStatusField(f.name)
    ) {
      const docPair = DOC_PAIR_BY_STATUS_FIELD[f.name as keyof typeof DOC_PAIR_BY_STATUS_FIELD]
      const fileName = docPair ? ((values?.[docPair.fileName] as string | undefined) ?? '') : ''
      const status = values?.[f.name] as DocumentStatus | undefined
      const confirmedAtField =
        STATUS_CONFIRM_META_BY_STATUS[f.name as keyof typeof STATUS_CONFIRM_META_BY_STATUS]?.atField

      return (
        <div
          key={f.name}
          className={cn('flex min-w-0 flex-col gap-1.5', spanClass(f.span, false))}
        >
          <StageFieldLabel label={readonlyLabel} />
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="min-w-0 flex-1">
              <StageFieldReadonly
                hideLabel
                label={readonlyLabel}
                value={readField(ctx, values, f)}
                source={getReadonlyFieldSource(f, {
                  fieldEditable,
                  isCurrent,
                  canEditStage: canEdit,
                })}
                isSelect
              />
            </div>
            {docPair ? (
              <div className="min-w-0 flex-1">
                <StageDocumentField
                  projectId={project.id}
                  documentType={docPair.documentType}
                  value={fileName}
                  variant={getStageDocumentFieldVariant(fileName || undefined, status, {
                    uploadedAt: project.documentFiles?.[docPair.documentType]?.uploadedAt,
                    confirmedAt: confirmedAtField
                      ? (values?.[confirmedAtField] as string | undefined)
                      : undefined,
                    reuploadedAt: project.documentFiles?.[docPair.documentType]?.reuploadedAt,
                  })}
                  interaction="download"
                />
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <StageFieldReadonly
        key={f.name}
        label={readonlyLabel}
        value={readField(ctx, values, f)}
        multiline={f.type === 'textarea'}
        source={getReadonlyFieldSource(f, {
          fieldEditable,
          isCurrent,
          canEditStage: canEdit,
        })}
        isSelect={f.type === 'select'}
        className={spanClass(f.span, f.type === 'textarea')}
      />
    )
  }

  return (
    <Collapsible defaultOpen className="w-full">
      <div
        className={cn(
          '@container flex flex-col rounded-[15px] border bg-white p-2.5 @xl:p-5',
          stageBlockBorderClass(hasDraftHighlight),
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StageStatusHeader
            statusLabel={isCurrent ? 'Текущий этап:' : 'Этап пройден:'}
            title={ALL_STAGE_LABELS[stage]}
            titleClassName={funnelColor}
            collapsible
          />
          {isCurrent && canAdvance && (
            <Button
              type="button"
              onClick={() => onAdvance?.(values)}
              className="h-[38px] rounded-[10px] px-4 text-sm"
            >
              Следующий этап
              <ArrowRight className="size-3.5" />
            </Button>
          )}
          {showEditButton && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(true)}
              className="h-[38px] rounded-[10px] border-[#B1B1B1] bg-white px-4 text-sm"
            >
              <Pencil className="size-3.5" />
              Редактировать
            </Button>
          )}
        </div>
        <CollapsibleContent className="flex flex-col gap-4 pt-4">
          <div className="h-px w-full bg-[#F0F0F0]" />
          {visibleFields.length === 0 && extras.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Подробное содержимое раздела — в следующей итерации
            </p>
          ) : (
            <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
              {stage === 'documents_confirmed'
                ? renderDocumentsConfirmedGrid(gridFields, renderField)
                : renderNarrowPairs(gridFields, renderField)}
              {extras.map((extra) =>
                extra.source === 'manager' ? (
                  <StageFieldReadonly
                    key="manager"
                    label={extra.label}
                    value={record?.enteredBy ?? 'Иванов Иван Иванович'}
                    source="system"
                  />
                ) : (
                  <StageFieldReadonly
                    key="enteredAt"
                    label={extra.label}
                    value={formatDate(record?.enteredAt) ?? '09-05-2026'}
                    source="system"
                  />
                ),
              )}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
