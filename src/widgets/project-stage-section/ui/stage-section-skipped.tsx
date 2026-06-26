import { Pencil } from 'lucide-react'
import { useState } from 'react'

import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import type { ProjectArticles } from '@/entities/project-article'
import { useUserRole } from '@/entities/user-role'
import { stageBlockBorderClass } from '@/entities/stage-draft'
import type { StageRecord } from '@/features/advance-stage'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

import { canEditStage } from '../lib/stage-permissions'
import { StageSectionCurrent } from './stage-section-current'
import { StageStatusHeader } from './stage-status-header'

interface StageSectionSkippedProps {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
  hasDraftHighlight?: boolean
  /** Проект открыт только для просмотра — скрывает «Заполнить» и форму дозаполнения. */
  readOnly?: boolean
  onFillSkipped: (values: Partial<StageFormData>) => void
}

export function StageSectionSkipped({
  project,
  stage,
  record,
  articles,
  hasDraftHighlight,
  readOnly = false,
  onFillSkipped,
}: StageSectionSkippedProps) {
  const [editing, setEditing] = useState(false)
  const role = useUserRole()
  const canEdit = !readOnly && canEditStage(stage, role)
  const funnelColor =
    STAGE_FUNNEL[stage] === 'closing' ? 'text-funnel-closing' : 'text-funnel-preproject'

  if (editing) {
    return (
      <StageSectionCurrent
        project={project}
        stage={stage}
        record={record}
        articles={articles}
        hasDraftHighlight={hasDraftHighlight}
        readOnly={readOnly}
        editingMode="fill"
        onEditingSubmit={(values) => {
          onFillSkipped(values)
          setEditing(false)
        }}
        onCancelEditing={() => setEditing(false)}
      />
    )
  }

  return (
    <div
      className={cn(
        'bg-surface-subtle @container flex w-full flex-col rounded-[15px] border p-2.5 @xl:p-5',
        hasDraftHighlight ? stageBlockBorderClass(true) : 'border-border-medium border-dashed',
      )}
    >
      <div className="flex flex-col-reverse items-stretch gap-3 @xl:flex-row @xl:flex-wrap @xl:items-center @xl:justify-between">
        <StageStatusHeader
          statusLabel="Этап пропущен:"
          title={ALL_STAGE_LABELS[stage]}
          titleClassName={funnelColor}
          statusClassName="font-medium text-foreground-soft"
        />
        {canEdit ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(true)}
              className="border-border-strong h-[38px] rounded-[10px] bg-white px-4 text-sm"
            >
              <Pencil className="size-3.5" />
              Заполнить
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
