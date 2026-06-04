import { GridTableCell } from '@/shared/ui/grid-table'

import { formatPlumStatusTableValue } from '../lib/plum-status'
import type { Project } from '../model/types'

export function ProjectPlumStatusTableCell({ project }: { project: Project }) {
  return <GridTableCell muted>{formatPlumStatusTableValue(project)}</GridTableCell>
}
