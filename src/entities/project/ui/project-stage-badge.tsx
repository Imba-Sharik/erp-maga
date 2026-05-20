import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

import { CLOSING_STAGE_LABELS, isClosingStage } from '../lib/closing-stages'
import { ALL_STAGE_LABELS, isOutsideMagStage, STAGE_LABELS } from '../lib/stages'
import type { ProjectStage } from '../model/types'

function stageBadgeVariant(stage: ProjectStage) {
  if (isOutsideMagStage(stage)) return 'outline' as const
  if (isClosingStage(stage)) return 'funnelClosing' as const
  return 'funnelPreproject' as const
}

function stageBadgeLabel(stage: ProjectStage) {
  if (isOutsideMagStage(stage)) return ALL_STAGE_LABELS[stage]
  if (isClosingStage(stage)) return CLOSING_STAGE_LABELS[stage]
  return STAGE_LABELS[stage]
}

interface ProjectStageBadgeProps {
  stage: ProjectStage
  /** Узкая колонка таблицы: обрезка текста, полная подпись в `title`. */
  truncate?: boolean
  className?: string
}

export function ProjectStageBadge({ stage, truncate, className }: ProjectStageBadgeProps) {
  const label = stageBadgeLabel(stage)

  return (
    <Badge
      variant={stageBadgeVariant(stage)}
      title={truncate ? label : undefined}
      className={cn(
        'gap-1.5 px-2.5 py-0.5 text-xs',
        truncate ? 'max-w-full min-w-0 shrink' : 'w-fit shrink-0',
        className,
      )}
    >
      <span className="size-2 shrink-0 rounded-full bg-current" />
      <span className={cn(truncate && 'min-w-0 truncate')}>{label}</span>
    </Badge>
  )
}
