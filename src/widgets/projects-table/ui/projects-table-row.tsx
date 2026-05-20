import type { KeyboardEvent, ReactNode } from 'react'
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
import { ProjectManagerCell, type ProjectManagerCellProps } from './project-manager-cell'
import {
  Cell,
  EmptyTableCell,
  formatTableDate,
  ProjectHallCell,
  ProjectLoftCell,
  ProjectStageTableCell,
  ProjectTitleCell,
} from './table-row-cells'

const ROW_NAV_CLASS =
  'grid w-full cursor-pointer items-center text-left transition-colors hover:bg-[#FAF9F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'

function handleRowKeyDown(e: KeyboardEvent<HTMLDivElement>, goToDetail: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    goToDetail()
  }
}

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export interface ProjectsTableRowManagerProps {
  displayManager: string
  managerOptions: string[]
  isEditingManager: boolean
  onStartEditManager: () => void
  onAssignManager: (manager: string) => void
  onCancelEditManager: () => void
}

interface ProjectsTableRowProps extends ProjectsTableRowManagerProps {
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
  displayManager,
  managerOptions,
  isEditingManager,
  onStartEditManager,
  onAssignManager,
  onCancelEditManager,
}: ProjectsTableRowProps) {
  const navigate = useNavigate()
  const gridTemplate = getTableGridTemplate(columnView)
  const goToDetail = () => navigate(`/projects/${project.id}`, { state: backOrigin })

  const managerCellProps: ProjectManagerCellProps = {
    manager: displayManager,
    managerOptions,
    isEditing: isEditingManager,
    onStartEdit: onStartEditManager,
    onAssign: onAssignManager,
    onCancelEdit: onCancelEditManager,
  }

  if (columnView === 'outside-mag') {
    return (
      <div
        className={ROW_NAV_CLASS}
        style={{ gridTemplateColumns: gridTemplate }}
        role="button"
        tabIndex={0}
        onClick={goToDetail}
        onKeyDown={(e) => handleRowKeyDown(e, goToDetail)}
      >
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <ProjectStageTableCell stage={project.lastActiveStage} />
          <EmptyTableCell />
          <EmptyTableCell />
          <EmptyTableCell />
          <EmptyTableCell />
        </div>
        <div
          className="flex min-h-[44px] items-center justify-center px-2 py-2"
          onClick={stopRowNavigation}
          onPointerDown={stopRowNavigation}
        >
          {renderRowAction?.(project)}
        </div>
      </div>
    )
  }

  if (columnView === 'general') {
    return (
      <div
        className={ROW_NAV_CLASS}
        style={{ gridTemplateColumns: gridTemplate }}
        role="button"
        tabIndex={0}
        onClick={goToDetail}
        onKeyDown={(e) => handleRowKeyDown(e, goToDetail)}
      >
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <ProjectStageTableCell stage={project.stage} />
          <Cell muted>{formatTableDate(project.date)}</Cell>
          <Cell muted>{project.company || '—'}</Cell>
          <Cell muted>{project.phone || '—'}</Cell>
          <Cell muted>{formatTableDate(project.createdAt)}</Cell>
        </div>
      </div>
    )
  }

  return (
    <div
      className={ROW_NAV_CLASS}
      style={{ gridTemplateColumns: gridTemplate }}
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => handleRowKeyDown(e, goToDetail)}
    >
      <div className="contents">
        <ProjectTitleCell project={project} />
      </div>
      <ProjectManagerCell {...managerCellProps} />
      <div className="contents">
        <Cell muted>{project.company || '—'}</Cell>
        <ProjectStageTableCell stage={project.stage} />
        <Cell muted>{formatTableMoney(resolveSalesTotal(project))}</Cell>
        <Cell muted>{formatTableMoney(resolveNetProfitTotal(project))}</Cell>
        <Cell muted>{formatTableMoney(resolveTotalBonus(project))}</Cell>
      </div>
    </div>
  )
}
