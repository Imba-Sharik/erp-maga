import { Badge } from '@/shared/ui/badge'

import { CLOSING_STAGE_LABELS, isClosingStage } from '../lib/closing-stages'
import { STAGE_LABELS } from '../lib/stages'
import type { ProjectStage } from '../model/types'

export function ProjectStageBadge({ stage }: { stage: ProjectStage }) {
  const label = isClosingStage(stage) ? CLOSING_STAGE_LABELS[stage] : STAGE_LABELS[stage]

  return (
    <Badge variant="funnel" className="gap-1.5 px-2.5 py-0.5 text-xs">
      <span className="size-2 rounded-full bg-current" />
      {label}
    </Badge>
  )
}
