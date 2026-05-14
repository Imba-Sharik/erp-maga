import { ChevronDown } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import {
  STAGE_LABELS,
  contactChannelLabels,
  contractTypeLabels,
  type ProjectStage,
  type StageHistoryEntry,
} from '@/entities/project'

import { PASSED_EXTRAS, STAGE_FIELDS } from '../lib/fields-map'
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

function readField(
  entry: StageHistoryEntry,
  name: string,
  type: 'text' | 'textarea' | 'date' | 'select',
  options?: { value: string; label: string }[],
): string | undefined {
  const raw = (entry.data as Record<string, string | undefined>)[name]
  if (!raw) return undefined

  if (type === 'date') return formatDate(raw)
  if (type === 'select') {
    if (options) return options.find((o) => o.value === raw)?.label ?? raw
    if (name === 'contactChannel') return contactChannelLabels[raw as keyof typeof contactChannelLabels] ?? raw
    if (name === 'contractType') return contractTypeLabels[raw as keyof typeof contractTypeLabels] ?? raw
  }
  return raw
}

interface StageSectionPassedProps {
  stage: ProjectStage
  entry: StageHistoryEntry
}

export function StageSectionPassed({ stage, entry }: StageSectionPassedProps) {
  const fields = STAGE_FIELDS[stage]
  const extras = PASSED_EXTRAS[stage]

  return (
    <Collapsible defaultOpen className="w-full">
      <div className="flex flex-col gap-4 rounded-[15px] border border-[#B1B1B1] bg-white p-5">
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 text-sm">
          <span className="font-medium text-[#454545]">Этап пройден:</span>
          <span className="text-funnel-preproject font-semibold">{STAGE_LABELS[stage]}</span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-4">
          <div className="h-px w-full bg-[#F0F0F0]" />
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 @[640px]:grid-cols-3">
            {fields.map((f) => (
              <StageFieldReadonly
                key={f.name}
                label={f.label}
                value={readField(entry, f.name, f.type, f.options)}
                multiline={f.type === 'textarea'}
                className={f.type === 'textarea' ? '@[640px]:row-span-2' : undefined}
              />
            ))}
            {extras.map((extra) =>
              extra.source === 'manager' ? (
                <StageFieldReadonly
                  key="manager"
                  label={extra.label}
                  value={entry.managerName}
                />
              ) : (
                <StageFieldReadonly
                  key="enteredAt"
                  label={extra.label}
                  value={formatDate(entry.enteredAt)}
                />
              ),
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
