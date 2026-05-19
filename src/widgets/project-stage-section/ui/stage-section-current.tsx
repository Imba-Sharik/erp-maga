import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  stageFormSchemas,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import { useCurrentUser } from '@/entities/current-user'
import type { ProjectArticles } from '@/entities/project-articles'
import { useUserRole } from '@/entities/user-role'
import type { StageRecord } from '@/features/advance-stage'

import { STAGE_FIELDS, type StageFieldConfig } from '../lib/fields-map'
import { renderNarrowPairs } from '../lib/render-narrow-pairs'
import { resolveSystemValue } from '../lib/resolve-system-value'
import { canEditStage } from '../lib/stage-permissions'
import { StageDateField } from './stage-date-field'
import { StageFieldReadonly } from './stage-field-readonly'

type SignedSchema = (typeof stageFormSchemas)['contract_signed']
type SignedFormValues = z.infer<SignedSchema>

function getDefaults(stage: ProjectStage, data: Partial<StageFormData>): SignedFormValues {
  const fields = STAGE_FIELDS[stage]
  const result: Record<string, unknown> = {}
  for (const f of fields) {
    const v = data[f.name]
    if (f.type === 'select') {
      result[f.name] = v ?? ''
    } else {
      result[f.name] = v ?? ''
    }
  }
  return result as SignedFormValues
}

interface StageSectionCurrentProps {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
  onAdvance?: (values: Partial<StageFormData>) => void
  onPatchValues?: (patch: Partial<StageFormData>) => void
}

/**
 * Селекты, при выборе значения которых надо сразу штамповать `*ConfirmedAt`/`*ConfirmedBy`
 * текущим юзером — для per-row аудита. Маппинг явный, потому что имена `*At`/`*By`
 * не всегда выводятся из имени статуса (ср. `projectDocsStatus → projectDocsConfirmedAt`
 * vs `dataConfirmedStatus → dataConfirmedAt`).
 */
const CONFIRM_META_BY_STATUS: Partial<
  Record<keyof StageFormData, { atField: keyof StageFormData; byField: keyof StageFormData }>
> = {
  projectDocsStatus: { atField: 'projectDocsConfirmedAt', byField: 'projectDocsConfirmedBy' },
  subleaseDocsStatus: { atField: 'subleaseDocsConfirmedAt', byField: 'subleaseDocsConfirmedBy' },
  staffReceiptsStatus: { atField: 'staffReceiptsConfirmedAt', byField: 'staffReceiptsConfirmedBy' },
  dataConfirmedStatus: { atField: 'dataConfirmedAt', byField: 'dataConfirmedBy' },
}

export function StageSectionCurrent({
  project,
  stage,
  record,
  articles,
  onAdvance,
  onPatchValues,
}: StageSectionCurrentProps) {
  const schema = stageFormSchemas[stage]
  const fields = STAGE_FIELDS[stage]
  const defaults = getDefaults(stage, record?.values ?? {})
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  const role = useUserRole()
  const canEdit = canEditStage(stage, role)
  const currentUser = useCurrentUser()

  const form = useForm<SignedFormValues>({
    resolver: zodResolver(schema as SignedSchema),
    defaultValues: defaults,
    mode: 'onSubmit',
  })

  const handleAdvance = form.handleSubmit((values) =>
    onAdvance?.(values as Partial<StageFormData>),
  )

  const renderField = (f: StageFieldConfig) => {
    if (f.source === 'system' || !canEdit) {
      const raw =
        f.source === 'system'
          ? resolveSystemValue(f.name, f.mockValue, { project, stage, record, articles })
          : undefined
      let display = raw
      if (raw && f.type === 'select') {
        display = f.options?.find((o) => o.value === raw)?.label ?? raw
      } else if (raw && f.type === 'date') {
        const d = new Date(raw)
        if (!Number.isNaN(d.getTime())) display = d.toLocaleDateString('ru-RU')
      }
      return (
        <StageFieldReadonly
          key={f.name}
          label={f.label}
          value={display}
          source="system"
          isSelect={f.type === 'select'}
          multiline={f.type === 'textarea'}
        />
      )
    }
    return (
    <FormField
      key={f.name}
      control={form.control}
      name={f.name as keyof SignedFormValues}
      render={({ field }) => (
        <FormItem className={f.type === 'textarea' ? 'flex h-full min-w-0 flex-col @[640px]:row-span-2' : 'min-w-0'}>
          <FormLabel className="text-xs font-medium text-[#454545]">
            {f.label}
            {f.required ? <span className="text-[#D25252]">*</span> : null}
          </FormLabel>
          <FormControl>
            {f.type === 'textarea' ? (
              <Textarea
                {...field}
                value={(field.value as string) ?? ''}
                placeholder={f.placeholder}
                className="h-full min-h-[90px] flex-1 resize-none rounded-[10px] border-[#B1B1B1] text-sm"
              />
            ) : f.type === 'select' ? (
              <Select
                value={(field.value as string) ?? ''}
                onValueChange={(value) => {
                  field.onChange(value)
                  // Если у статуса есть пара `*ConfirmedAt`/`*ConfirmedBy` — штампим их
                  // прямо в момент выбора, для per-row аудита.
                  const meta = CONFIRM_META_BY_STATUS[f.name as keyof StageFormData]
                  if (meta) {
                    onPatchValues?.({
                      [f.name]: value,
                      [meta.atField]: new Date().toISOString(),
                      [meta.byField]: currentUser.fullName,
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

  return (
    <div className="flex w-full flex-col gap-4 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-[#454545]">Текущий этап:</span>
          <span className={`${funnelColor} font-semibold`}>{ALL_STAGE_LABELS[stage]}</span>
        </div>
        {canEdit && stage !== 'closed' ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button
              type="button"
              onClick={handleAdvance}
              className="h-[38px] rounded-[10px] px-4 text-sm"
            >
              {stage === 'contract_signed' ? 'Готов к проведению' : 'Следующий этап'}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>
      <div className="h-px w-full bg-[#F0F0F0]" />
      <Form {...form}>
        <form className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
            {renderNarrowPairs(fields, renderField)}
          </div>
        </form>
      </Form>
    </div>
  )
}
