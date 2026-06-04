import type { Project } from '../model/types'
import { shouldShowPlumStatusLine } from '../lib/plum-status'

export function ProjectPlumStatusLine({ project }: { project: Project }) {
  if (!shouldShowPlumStatusLine(project)) return null

  return <p className="text-xs text-[#ACACAC]">Статус в PLUM: {project.plumEventStatusLabel}</p>
}
