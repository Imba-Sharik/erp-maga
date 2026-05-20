import type { ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { Pencil } from 'lucide-react'

import { ProjectStageBadge, type Project, type ProjectStage } from '@/entities/project'

export const TABLE_EMPTY = '—'

export function formatTableDate(iso: string): string {
  if (!iso) return TABLE_EMPTY
  try {
    return format(parseISO(iso), 'dd.MM.yyyy')
  } catch {
    return iso
  }
}

export function Cell({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <div
      className={`flex min-h-[44px] min-w-0 items-center px-3 py-2 text-sm ${
        muted ? 'text-[#ACACAC]' : 'text-[#454545]'
      }`}
    >
      {typeof children === 'string' ? (
        <span className="w-full truncate">{children}</span>
      ) : (
        children
      )}
    </div>
  )
}

export function ProjectTitleCell({ project }: { project: Project }) {
  return (
    <Cell>
      <span className="w-full truncate font-medium text-[#454545]">
        {project.title || TABLE_EMPTY}
      </span>
    </Cell>
  )
}

export function ProjectLoftCell({ project }: { project: Project }) {
  return <Cell muted>{project.loft || TABLE_EMPTY}</Cell>
}

export function ProjectHallCell({ project }: { project: Project }) {
  return <Cell muted>{project.hall || TABLE_EMPTY}</Cell>
}

export function ProjectManagerCell({ project }: { project: Project }) {
  return (
    <Cell>
      <span className="flex w-full min-w-0 items-center gap-1.5">
        <Pencil className="size-3 shrink-0 text-[#BCBCBC]" />
        <span className="min-w-0 truncate text-[#ACACAC]">{project.manager || TABLE_EMPTY}</span>
      </span>
    </Cell>
  )
}

export function EmptyTableCell() {
  return <Cell muted>{TABLE_EMPTY}</Cell>
}

/** Этап в ячейке таблицы: не вылезает за колонку, полный текст в `title`. */
export function ProjectStageTableCell({ stage }: { stage?: ProjectStage }) {
  if (!stage) return <EmptyTableCell />

  return (
    <Cell>
      <div className="w-full min-w-0">
        <ProjectStageBadge stage={stage} truncate />
      </div>
    </Cell>
  )
}
