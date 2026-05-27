import { Pencil } from 'lucide-react'
import { useState } from 'react'

import {
  ALL_STAGE_LABELS,
  STAGE_FUNNEL,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import type { ProjectArticles } from '@/entities/project-articles'
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
  onFillSkipped: (values: Partial<StageFormData>) => void
}

export function StageSectionSkipped({
  project,
  stage,
  record,
  articles,
  hasDraftHighlight,
  onFillSkipped,
}: StageSectionSkippedProps) {
  const [editing, setEditing] = useState(false)
  const role = useUserRole()
  const canEdit = canEditStage(stage, role)
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
        '@container flex w-full flex-col rounded-[15px] border bg-[#FAF9F6] p-2.5 @xl:p-5',
        hasDraftHighlight ? stageBlockBorderClass(true) : 'border-dashed border-[#C7C7C7]',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StageStatusHeader
          statusLabel="Этап пропущен:"
          title={ALL_STAGE_LABELS[stage]}
          titleClassName={funnelColor}
          statusClassName="font-medium text-[#6B6B6B]"
        />
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
            className="h-[38px] rounded-[10px] border-[#B1B1B1] bg-white px-4 text-sm"
          >
            <Pencil className="size-3.5" />
            Заполнить
          </Button>
        ) : null}
      </div>
    </div>
  )
}
