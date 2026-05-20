import type { ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ProjectStageBadge, type Project, type ProjectBackOrigin } from '@/entities/project'

import { TABLE_GRID_TEMPLATE } from '../lib/table-columns'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'dd.MM.yyyy')
  } catch {
    return iso
  }
}

interface ProjectsTableRowProps {
  project: Project
  backOrigin: ProjectBackOrigin
}

export function ProjectsTableRow({ project, backOrigin }: ProjectsTableRowProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${project.id}`, { state: backOrigin })}
      className="grid w-full items-center border-b border-[#EDEDED] text-left transition-colors last:border-b-0 hover:bg-[#FAF9F6]"
      style={{ gridTemplateColumns: TABLE_GRID_TEMPLATE }}
    >
      <Cell>
        <span className="w-full truncate font-medium text-[#454545]">
          {project.title || '—'}
        </span>
      </Cell>
      <Cell muted>{project.loft || '—'}</Cell>
      <Cell muted>{project.hall || '—'}</Cell>
      <Cell>
        <span className="flex w-full min-w-0 items-center gap-1.5">
          <Pencil className="size-3 shrink-0 text-[#BCBCBC]" />
          <span className="min-w-0 truncate text-[#ACACAC]">{project.manager || '—'}</span>
        </span>
      </Cell>
      <Cell>
        <ProjectStageBadge stage={project.stage} />
      </Cell>
      <Cell muted>{formatDate(project.date)}</Cell>
      <Cell muted>{project.company || '—'}</Cell>
      <Cell muted>{project.phone || '—'}</Cell>
      <Cell muted>{formatDate(project.createdAt)}</Cell>
    </button>
  )
}

function Cell({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <div
      className={`flex min-h-[44px] min-w-0 items-center px-3 py-2 text-sm ${
        muted ? 'text-[#ACACAC]' : 'text-[#454545]'
      }`}
    >
      {typeof children === 'string' ? <span className="w-full truncate">{children}</span> : children}
    </div>
  )
}
