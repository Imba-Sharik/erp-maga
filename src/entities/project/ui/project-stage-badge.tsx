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

export function ProjectStageBadge({ stage }: { stage: ProjectStage }) {
  const label = stageBadgeLabel(stage)

  return (
    <Badge variant={stageBadgeVariant(stage)} className="gap-1.5 px-2.5 py-0.5 text-xs">
      <span className="size-2 rounded-full bg-current" />
      {label}
    </Badge>
  )
}
