import { Badge } from '@/shared/ui/badge'

import { STAGE_LABELS } from '../lib/stages'
import type { ProjectStage } from '../model/types'

export function ProjectStageBadge({ stage }: { stage: ProjectStage }) {
  return (
    <Badge variant="funnel" className="gap-1.5 px-2.5 py-0.5 text-xs">
      <span className="size-2 rounded-full bg-current" />
      {STAGE_LABELS[stage]}
    </Badge>
  )
}
