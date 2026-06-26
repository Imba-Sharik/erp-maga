import type { Project } from '../model/types'
import { shouldShowPlumStatusLine } from '../lib/plum-status'

export function ProjectPlumStatusLine({ project }: { project: Project }) {
  if (!shouldShowPlumStatusLine(project)) return null

  return (
    <p className="text-muted-foreground text-xs">Статус в PLUM: {project.plumEventStatusLabel}</p>
  )
}
