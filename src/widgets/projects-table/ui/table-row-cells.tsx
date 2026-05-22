import { format, parseISO } from 'date-fns'

import { ProjectStageBadge, type Project, type ProjectStage } from '@/entities/project'
import { GridTableCell, TABLE_EMPTY } from '@/shared/ui/grid-table'

export { TABLE_EMPTY }

export function formatTableDate(iso: string): string {
  if (!iso) return TABLE_EMPTY
  try {
    return format(parseISO(iso), 'dd.MM.yyyy')
  } catch {
    return iso
  }
}

/** Дата + время — для «Дата подтверждения» в закрытых запросах. */
export function formatTableDateTime(iso: string): string {
  if (!iso) return TABLE_EMPTY
  try {
    return format(parseISO(iso), 'dd.MM.yyyy HH:mm')
  } catch {
    return iso
  }
}

export function ProjectTitleCell({ project }: { project: Project }) {
  return (
    <GridTableCell>
      <span className="w-full truncate font-medium text-[#454545]">
        {project.title || TABLE_EMPTY}
      </span>
    </GridTableCell>
  )
}

export function ProjectLoftCell({ project }: { project: Project }) {
  return <GridTableCell muted>{project.loft || TABLE_EMPTY}</GridTableCell>
}

export function ProjectHallCell({ project }: { project: Project }) {
  return <GridTableCell muted>{project.hall || TABLE_EMPTY}</GridTableCell>
}

export function EmptyTableCell() {
  return <GridTableCell muted>{TABLE_EMPTY}</GridTableCell>
}

export function ProjectArchivedAtCell({ project }: { project: Project }) {
  return <GridTableCell muted>{formatTableDate(project.archivedAt ?? '')}</GridTableCell>
}

/** Этап в ячейке таблицы: не вылезает за колонку, полный текст в `title`. */
export function ProjectStageTableCell({ stage }: { stage?: ProjectStage }) {
  if (!stage) return <EmptyTableCell />

  return (
    <GridTableCell>
      <div className="w-full min-w-0">
        <ProjectStageBadge stage={stage} truncate />
      </div>
    </GridTableCell>
  )
}
