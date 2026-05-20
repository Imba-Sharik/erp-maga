import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Project, ProjectBackOrigin } from '@/entities/project'

import type { ProjectsTableColumnView } from '../lib/economics-columns'
import {
  formatTableMoney,
  resolveNetProfitTotal,
  resolveSalesTotal,
  resolveTotalBonus,
} from '../lib/economics-columns'
import { getTableGridTemplate } from '../lib/table-columns'
import {
  Cell,
  EmptyTableCell,
  formatTableDate,
  ProjectHallCell,
  ProjectLoftCell,
  ProjectManagerCell,
  ProjectStageTableCell,
  ProjectTitleCell,
} from './table-row-cells'

interface ProjectsTableRowProps {
  project: Project
  columnView: ProjectsTableColumnView
  backOrigin: ProjectBackOrigin
  renderRowAction?: (project: Project) => ReactNode
}

export function ProjectsTableRow({
  project,
  columnView,
  backOrigin,
  renderRowAction,
}: ProjectsTableRowProps) {
  const navigate = useNavigate()
  const gridTemplate = getTableGridTemplate(columnView)
  const goToDetail = () => navigate(`/projects/${project.id}`, { state: backOrigin })

  if (columnView === 'outside-mag') {
    return (
      <div
        className="grid w-full items-center text-left transition-colors hover:bg-[#FAF9F6]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <button type="button" onClick={goToDetail} className="contents text-left">
          <OutsideMagTableCells project={project} />
        </button>
        <div className="flex min-h-[44px] items-center justify-center px-2 py-2">
          {renderRowAction?.(project)}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={goToDetail}
      className="grid w-full items-center text-left transition-colors hover:bg-[#FAF9F6]"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {columnView === 'general' ? (
        <GeneralTableCells project={project} />
      ) : (
        <EconomicsTableCells project={project} />
      )}
    </button>
  )
}

function OutsideMagTableCells({ project }: { project: Project }) {
  return (
    <>
      <ProjectTitleCell project={project} />
      <ProjectLoftCell project={project} />
      <ProjectHallCell project={project} />
      <ProjectManagerCell project={project} />
      <ProjectStageTableCell stage={project.lastActiveStage} />
      <EmptyTableCell />
      <EmptyTableCell />
      <EmptyTableCell />
      <EmptyTableCell />
    </>
  )
}

function GeneralTableCells({ project }: { project: Project }) {
  return (
    <>
      <ProjectTitleCell project={project} />
      <ProjectLoftCell project={project} />
      <ProjectHallCell project={project} />
      <ProjectManagerCell project={project} />
      <ProjectStageTableCell stage={project.stage} />
      <Cell muted>{formatTableDate(project.date)}</Cell>
      <Cell muted>{project.company || '—'}</Cell>
      <Cell muted>{project.phone || '—'}</Cell>
      <Cell muted>{formatTableDate(project.createdAt)}</Cell>
    </>
  )
}

function EconomicsTableCells({ project }: { project: Project }) {
  return (
    <>
      <ProjectTitleCell project={project} />
      <ProjectManagerCell project={project} />
      <Cell muted>{project.company || '—'}</Cell>
      <ProjectStageTableCell stage={project.stage} />
      <Cell muted>{formatTableMoney(resolveSalesTotal(project))}</Cell>
      <Cell muted>{formatTableMoney(resolveNetProfitTotal(project))}</Cell>
      <Cell muted>{formatTableMoney(resolveTotalBonus(project))}</Cell>
    </>
  )
}
