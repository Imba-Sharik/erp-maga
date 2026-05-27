import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { PhoneInput } from '@/shared/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  getStageFormSchema,
  type DocumentStatus,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import { useCurrentUser } from '@/entities/current-user'
import type { ProjectArticles } from '@/entities/project-articles'
import { DOC_PAIR_BY_STATUS_FIELD } from '@/entities/project-documents'
import { stageDraftActions, stageBlockBorderClass } from '@/entities/stage-draft'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'
import { useUpdateDocumentStatus } from '@/features/update-document-status'
import { cn } from '@/shared/lib/utils'

import {
  confirmedAtLabelForDocStatus,
  FILE_NAME_TO_STATUS_FIELD,
  getStageDocumentFieldVariant,
  statusFieldForConfirmedAt,
} from '../lib/document-status-fields'
import { filterStageFields, STAGE_FIELDS, type StageFieldConfig } from '../lib/fields-map'
import { getReadonlyFieldSource } from '../lib/readonly-field-source'
import { renderNarrowPairs } from '../lib/render-narrow-pairs'
import { resolveSystemValue } from '../lib/resolve-system-value'
import { canAdvanceStage, canEditField, canEditStage } from '../lib/stage-permissions'
import { StageDateField } from './stage-date-field'
import { StageDocumentField } from '@/features/stage-document'
import { StageFieldLabel } from './stage-field-label'
import { StageFieldReadonly } from './stage-field-readonly'
import { StageStatusHeader } from './stage-status-header'

type SignedFormValues = Record<string, unknown>

function getDefaults(fields: StageFieldConfig[], data: Partial<StageFormData>): SignedFormValues {
  const result: Record<string, unknown> = {}
  for (const f of fields) {
    const v = data[f.name]
    result[f.name] = v ?? ''
  }
  return result
}

interface StageSectionCurrentProps {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
  onAdvance?: (values: Partial<StageFormData>) => void
  onPatchValues?: (patch: Partial<StageFormData>) => void
  /**
   * Режим инлайн-редактирования прошлого этапа:
   * - `'fill'` — дозаполнить ранее пропущенный этап
   * - `'edit'` — поправить уже заполненный пройденный этап
   * Шапка и подпись CTA меняются под режим, отправка идёт в `onEditingSubmit`.
   */
  editingMode?: 'fill' | 'edit'
  hasDraftHighlight?: boolean
  onEditingSubmit?: (values: Partial<StageFormData>) => void
  onCancelEditing?: () => void
}

export function StageSectionCurrent({
  project,
  stage,
  record,
  articles,
  onAdvance,
  onPatchValues,
  editingMode,
  hasDraftHighlight,
  onEditingSubmit,
  onCancelEditing,
}: StageSectionCurrentProps) {
  const role = useUserRole()
  const allFields = STAGE_FIELDS[stage]
  const visibleFields = useMemo(
    () => filterStageFields(allFields, role, 'current'),
    [allFields, role],
  )
  const editableFields = useMemo(
    () => visibleFields.filter((f) => f.source !== 'system'),
    [visibleFields],
  )
  const schema = getStageFormSchema(stage, role)
  const defaults = getDefaults(editableFields, record?.values ?? {})
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  const canEdit = canEditStage(stage, role)
  const canAdvance = canAdvanceStage(stage, role)
  const currentUser = useCurrentUser()
  const { update: updateDocumentStatus } = useUpdateDocumentStatus()
  const isMountRef = useRef(true)

  useEffect(() => {
    isMountRef.current = false
  }, [])

  const form = useForm<SignedFormValues>({
    resolver: zodResolver(schema as never) as Resolver<SignedFormValues>,
    defaultValues: defaults,
    mode: 'onSubmit',
  })

  useEffect(() => {
    const sub = form.watch((values) => {
      if (!canEdit) return
      const draftValues = values as Record<string, unknown>
      const hasContent = editableFields.some((f) => Boolean(draftValues[f.name]))
      if (hasContent) {
        stageDraftActions.save(project.id, {
          stage,
          authorId: currentUser.id,
          values: draftValues as Partial<StageFormData>,
          savedAt: new Date().toISOString(),
          highlightPending: isMountRef.current ? undefined : false,
        })
      } else {
        stageDraftActions.clear(project.id, currentUser.id)
      }
    })
    return () => sub.unsubscribe()
  }, [form, editableFields, canEdit, project.id, stage, currentUser.id])

  const watchedValues = form.watch() as Partial<StageFormData>

  const mergedValues = useMemo(
    () => ({ ...record?.values, ...watchedValues }),
    [record?.values, watchedValues],
  )

  const handleAdvance = form.handleSubmit((values) => onAdvance?.(values as Partial<StageFormData>))
  const handleEditingSubmit = form.handleSubmit((values) =>
    onEditingSubmit?.(values as Partial<StageFormData>),
  )

  const renderField = (f: StageFieldConfig) => {
    const fieldEditable = canEditField(stage, role, f)
    const values = record?.values ?? {}

    if (f.source === 'system' || !fieldEditable) {
      const raw =
        f.source === 'system'
          ? resolveSystemValue(f.name, f.mockValue, { project, stage, record, articles })
          : (values[f.name] as string | undefined)
      let display = raw
      if (raw && f.type === 'select') {
        display = f.options?.find((o) => o.value === raw)?.label ?? raw
      } else if (raw && f.type === 'date') {
        const d = new Date(raw)
        if (!Number.isNaN(d.getTime())) display = d.toLocaleDateString('ru-RU')
      }
      if (!display && f.source !== 'system') return null
      const statusForLabelField = statusFieldForConfirmedAt(f.name)
      const readonlyLabel =
        statusForLabelField != null
          ? confirmedAtLabelForDocStatus(
              mergedValues[statusForLabelField] as DocumentStatus | undefined,
              f.label,
            )
          : f.label
      return (
        <StageFieldReadonly
          key={f.name}
          label={readonlyLabel}
          value={display}
          source={getReadonlyFieldSource(f, { fieldEditable })}
          isSelect={f.type === 'select'}
          multiline={f.type === 'textarea'}
        />
      )
    }
    return (
      <FormField
        key={f.name}
        control={form.control}
        name={f.name as string}
        render={({ field }) => (
          <FormItem
            className={
              f.type === 'textarea' ? 'flex h-full min-w-0 flex-col @[640px]:row-span-2' : 'min-w-0'
            }
          >
            <StageFieldLabel form label={f.label} required={f.required} />
            <FormControl>
              {f.type === 'document' && f.documentType ? (
                <StageDocumentField
                  projectId={project.id}
                  documentType={f.documentType}
                  value={(field.value as string) ?? ''}
                  variant={getStageDocumentFieldVariant(
                    (field.value as string) || undefined,
                    (() => {
                      const statusField =
                        f.name in FILE_NAME_TO_STATUS_FIELD
                          ? FILE_NAME_TO_STATUS_FIELD[
                              f.name as keyof typeof FILE_NAME_TO_STATUS_FIELD
                            ]
                          : undefined
                      return statusField
                        ? (mergedValues[statusField] as DocumentStatus | undefined)
                        : undefined
                    })(),
                  )}
                  interaction="upload"
                  onChange={(fileName) => {
                    field.onChange(fileName)
                    // Оптимистично пробрасываем имя файла в flow.records, чтобы
                    // вкладка «Документы» сразу видела свежий файл, не ожидая рефетча.
                    onPatchValues?.({ [f.name]: fileName } as Partial<StageFormData>)
                  }}
                  disabled={!fieldEditable}
                />
              ) : f.type === 'textarea' ? (
                <Textarea
                  {...field}
                  value={(field.value as string) ?? ''}
                  placeholder={f.placeholder}
                  style={{ fieldSizing: 'fixed' }}
                  className="native-os-scrollbar h-full min-h-[90px] flex-1 resize-none rounded-[10px] border-[#B1B1B1] text-sm"
                />
              ) : f.type === 'select' ? (
                <Select
                  value={(field.value as string) ?? ''}
                  onValueChange={(value) => {
                    field.onChange(value)
                    const isDocStatus =
                      value === 'present' || value === 're_requested' || value === 'not_required'
                    // Аудит (*ConfirmedAt/*ConfirmedBy) — только с бэка после PATCH, не локальный stub.
                    const patch: Partial<StageFormData> = {
                      [f.name]: isDocStatus ? (value as DocumentStatus) : undefined,
                    }
                    onPatchValues?.(patch)

                    const docPair =
                      DOC_PAIR_BY_STATUS_FIELD[f.name as keyof typeof DOC_PAIR_BY_STATUS_FIELD]
                    if (docPair && isDocStatus) {
                      updateDocumentStatus({
                        projectId: project.id,
                        documentType: docPair.documentType,
                        status: value as DocumentStatus,
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-full rounded-[10px] border-[#B1B1B1] text-sm">
                    <SelectValue placeholder={f.placeholder ?? 'Выберите…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === 'date' ? (
                <StageDateField
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  placeholder={f.placeholder}
                />
              ) : f.type === 'phone' ? (
                <PhoneInput
                  name={field.name}
                  ref={field.ref}
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="h-9 rounded-[10px] border-[#B1B1B1] text-sm"
                />
              ) : (
                <Input
                  {...field}
                  value={(field.value as string) ?? ''}
                  placeholder={f.placeholder}
                  className="h-9 rounded-[10px] border-[#B1B1B1] text-sm"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  const EDITING_HEADER_LABEL: Record<'fill' | 'edit', string> = {
    fill: 'Заполнение пропущенного этапа:',
    edit: 'Редактирование этапа:',
  }
  const headerLabel = editingMode ? EDITING_HEADER_LABEL[editingMode] : 'Текущий этап:'
  const advanceLabel = stage === 'contract_signed' ? 'Готов к проведению' : 'Следующий этап'

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-[15px] border bg-white p-5',
        stageBlockBorderClass(hasDraftHighlight),
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StageStatusHeader
          statusLabel={headerLabel}
          title={ALL_STAGE_LABELS[stage]}
          titleClassName={funnelColor}
        />
        {canAdvance && stage !== 'closed' ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {editingMode ? (
              <>
                {onCancelEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancelEditing}
                    className="h-[38px] rounded-[10px] border-[#B1B1B1] px-4 text-sm"
                  >
                    Отмена
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={handleEditingSubmit}
                  className="h-[38px] rounded-[10px] px-4 text-sm"
                >
                  Сохранить
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handleAdvance}
                className="h-[38px] rounded-[10px] px-4 text-sm"
              >
                {advanceLabel}
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        ) : null}
      </div>
      <div className="h-px w-full bg-[#F0F0F0]" />
      <Form {...form}>
        <form className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
            {renderNarrowPairs(visibleFields, renderField)}
          </div>
        </form>
      </Form>
    </div>
  )
}
