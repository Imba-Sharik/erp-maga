import { ArrowRight, ChevronDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  contactChannelLabels,
  contractTypeLabels,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'

import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'

import { PASSED_EXTRAS, STAGE_FIELDS, type StageFieldConfig } from '../lib/fields-map'
import { partitionFields } from '../lib/partition-fields'
import { renderNarrowPairs } from '../lib/render-narrow-pairs'
import { resolveSystemValue } from '../lib/resolve-system-value'
import { canEditStage } from '../lib/stage-permissions'
import { StageFieldDemoEditable } from './stage-field-demo-editable'
import { StageFieldReadonly } from './stage-field-readonly'

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
}

function fallbackValue(
  ctx: ResolveCtx,
  values: Partial<StageFormData> | undefined,
  f: StageFieldConfig,
): string | undefined {
  const fromValues = (values as Record<string, string | undefined> | undefined)?.[f.name]
  if (fromValues) return fromValues
  if (f.source === 'system') return resolveSystemValue(f.name, f.mockValue, ctx)
  return f.mockValue
}

function readField(
  ctx: ResolveCtx,
  values: Partial<StageFormData> | undefined,
  f: StageFieldConfig,
): string | undefined {
  const raw = fallbackValue(ctx, values, f)
  if (!raw) return undefined

  if (f.type === 'date') return formatDate(raw)
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
  onAdvance?: (values?: Partial<StageFormData>) => void
}

export function StageSectionPassed({
  project,
  stage,
  isCurrent = false,
  record,
  onAdvance,
}: StageSectionPassedProps) {
  const ctx: ResolveCtx = { project, stage, record }
  const values = record?.values
  const fields = STAGE_FIELDS[stage]
  const { main: mainFields, meta: metaFields } = partitionFields(stage, fields)
  const extras = PASSED_EXTRAS[stage]
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  const role = useUserRole()
  const canEdit = canEditStage(stage, role)

  const renderField = (f: StageFieldConfig) =>
    f.source === 'manager' && canEdit && isCurrent ? (
      <StageFieldDemoEditable
        key={f.name}
        field={f}
        initialValue={fallbackValue(ctx, values, f)}
        className={spanClass(f.span, f.type === 'textarea')}
      />
    ) : (
      <StageFieldReadonly
        key={f.name}
        label={f.label}
        value={readField(ctx, values, f)}
        multiline={f.type === 'textarea'}
        // DEMO: показываем source как есть (manager solid / system dashed),
        // чтобы было видно, какие поля заполняет менеджер, а какие — система.
        source={canEdit ? f.source : 'system'}
        isSelect={f.type === 'select'}
        className={spanClass(f.span, f.type === 'textarea')}
      />
    )

  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex flex-col gap-4 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-[#454545]">
              {isCurrent ? 'Текущий этап:' : 'Этап пройден:'}
            </span>
            <span className={`${funnelColor} font-semibold`}>{ALL_STAGE_LABELS[stage]}</span>
            <ChevronDown className="text-muted-foreground size-3.5" />
          </CollapsibleTrigger>
          {isCurrent && canEdit && (
            <Button
              type="button"
              onClick={() => onAdvance?.(values)}
              className="h-[38px] rounded-[10px] px-4 text-sm"
            >
              Следующий этап
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
        <CollapsibleContent className="flex flex-col gap-4">
          <div className="h-px w-full bg-[#F0F0F0]" />
          {fields.length === 0 && extras.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Подробное содержимое раздела — в следующей итерации
            </p>
          ) : (
            <>
              {mainFields.length > 0 && (
                <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
                  {renderNarrowPairs(mainFields, renderField)}
                </div>
              )}
              {metaFields.length > 0 && (
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-medium text-[#454545]">Информация</span>
                  <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
                    {metaFields.map(renderField)}
                  </div>
                </div>
              )}
              {extras.length > 0 && (
                <div className="flex flex-col gap-4">
                  <span className="text-sm font-medium text-[#454545]">Информация</span>
                  <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
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
                </div>
              )}
            </>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
