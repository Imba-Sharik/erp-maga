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
import type { StageRecord } from '@/features/advance-stage'
import { Button } from '@/shared/ui/button'

import { canEditStage } from '../lib/stage-permissions'
import { StageSectionCurrent } from './stage-section-current'

interface StageSectionSkippedProps {
  project: ProjectDetail
  stage: ProjectStage
  record?: StageRecord
  articles?: ProjectArticles
  onFillSkipped: (values: Partial<StageFormData>) => void
}

export function StageSectionSkipped({
  project,
  stage,
  record,
  articles,
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
    <div className="flex w-full flex-col rounded-[15px] border border-dashed border-[#C7C7C7] bg-[#FAF9F6] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-[#6B6B6B]">Этап пропущен:</span>
          <span className={`${funnelColor} font-semibold`}>{ALL_STAGE_LABELS[stage]}</span>
        </div>
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
