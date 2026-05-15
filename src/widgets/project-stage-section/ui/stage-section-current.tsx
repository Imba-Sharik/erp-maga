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
  STAGE_FUNNEL,
  STAGE_LABELS,
  stageFormSchemas,
  type PreprojectStage,
  type ProjectDetail,
  type StageFormData,
} from '@/entities/project'
import { useUserRole } from '@/entities/user-role'

import { STAGE_FIELDS, type StageFieldConfig } from '../lib/fields-map'
import { renderNarrowPairs } from '../lib/render-narrow-pairs'
import { canEditStage } from '../lib/stage-permissions'
import { StageFieldReadonly } from './stage-field-readonly'

type SignedSchema = (typeof stageFormSchemas)['signed']
type SignedFormValues = z.infer<SignedSchema>

function getDefaults(stage: PreprojectStage, data: Partial<StageFormData>): SignedFormValues {
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
  stage: PreprojectStage
  onAdvance?: (values: SignedFormValues) => void
  onMarkReady?: (values: SignedFormValues) => void
}

export function StageSectionCurrent({
  project: _project,
  stage,
  onAdvance,
  onMarkReady,
}: StageSectionCurrentProps) {
  const schema = stageFormSchemas[stage]
  const fields = STAGE_FIELDS[stage]
  const defaults = getDefaults(stage, {})
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'
  const role = useUserRole()
  const canEdit = canEditStage(stage, role)

  const form = useForm<SignedFormValues>({
    resolver: zodResolver(schema as SignedSchema),
    defaultValues: defaults,
    mode: 'onSubmit',
  })

  const handleAdvance = form.handleSubmit((values) => onAdvance?.(values))
  const handleReady = form.handleSubmit((values) => onMarkReady?.(values))

  const renderField = (f: StageFieldConfig) => {
    if (f.source === 'system' || !canEdit) {
      const raw = f.source === 'system' ? f.mockValue : undefined
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
        <FormItem className={f.type === 'textarea' ? 'flex h-full min-w-0 flex-col' : 'min-w-0'}>
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
                className="h-full min-h-[90px] flex-1 resize-none rounded-[10px] border-[#B1B1B1] text-[13px]"
              />
            ) : f.type === 'select' ? (
              <Select value={(field.value as string) ?? ''} onValueChange={field.onChange}>
                <SelectTrigger className="h-9 w-full rounded-[10px] border-[#B1B1B1] text-[13px]">
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
            ) : (
              <Input
                {...field}
                value={(field.value as string) ?? ''}
                placeholder={f.placeholder}
                className="h-9 rounded-[10px] border-[#B1B1B1] text-[13px]"
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
    <div className="flex w-full flex-col gap-2 rounded-[15px] border border-[#B1B1B1] bg-white px-5 py-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-[#454545]">Текущий этап:</span>
          <span className={`${funnelColor} font-semibold`}>{STAGE_LABELS[stage]}</span>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {stage === 'signed' ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleReady}
                className="text-funnel-preproject hover:text-funnel-preproject border-funnel-preproject hover:bg-funnel-preproject/15 h-[38px] rounded-[10px] bg-[#E9ECFF] px-4 text-[13px]"
              >
                Готов к проведению
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={handleAdvance}
              className="h-[38px] rounded-[10px] px-4 text-[13px]"
            >
              Следующий этап
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
