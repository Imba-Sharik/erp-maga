import { ChevronDown } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  contactChannelLabels,
  contractTypeLabels,
  type ProjectStage,
  type StageHistoryEntry,
} from '@/entities/project'

import { PASSED_EXTRAS, STAGE_FIELDS, type StageFieldConfig } from '../lib/fields-map'
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

function readField(entry: StageHistoryEntry, f: StageFieldConfig): string | undefined {
  const raw = (entry.data as Record<string, string | undefined>)[f.name] ?? f.mockValue
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
  stage: ProjectStage
  entry: StageHistoryEntry
}

export function StageSectionPassed({ stage, entry }: StageSectionPassedProps) {
  const fields = STAGE_FIELDS[stage]
  const extras = PASSED_EXTRAS[stage]
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'

  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex flex-col gap-4 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-sm">
          <span className="font-medium text-[#454545]">Этап пройден:</span>
          <span className={`${funnelColor} font-semibold`}>{ALL_STAGE_LABELS[stage]}</span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4">
          <div className="h-px w-full bg-[#F0F0F0]" />
          {fields.length === 0 && extras.length === 0 ? (
            <p className="text-muted-foreground text-[13px] italic">
              Подробное содержимое раздела — в следующей итерации
            </p>
          ) : (
            <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
              {fields.map((f) => (
                <StageFieldReadonly
                  key={f.name}
                  label={f.label}
                  value={readField(entry, f)}
                  multiline={f.type === 'textarea'}
                  source={f.source}
                  isSelect={f.type === 'select'}
                  className={spanClass(f.span, f.type === 'textarea')}
                />
              ))}
              {extras.map((extra) =>
                extra.source === 'manager' ? (
                  <StageFieldReadonly
                    key="manager"
                    label={extra.label}
                    value={entry.managerName || 'Иванов Иван Иванович'}
                    source="system"
                  />
                ) : (
                  <StageFieldReadonly
                    key="enteredAt"
                    label={extra.label}
                    value={formatDate(entry.enteredAt) ?? '09-05-2026'}
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
