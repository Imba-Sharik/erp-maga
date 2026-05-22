import type { KeyboardEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { getOutsideMagReasonLabel, type Project, type ProjectBackOrigin } from '@/entities/project'
import { GridTableCell, GridTableRow, GridTableRowActionCell } from '@/shared/ui/grid-table'

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
  formatTableDate,
  formatTableDateTime,
  ProjectArchivedAtCell,
  ProjectHallCell,
  ProjectLoftCell,
  ProjectStageTableCell,
  ProjectTitleCell,
} from './table-row-cells'

function handleRowKeyDown(e: KeyboardEvent<HTMLDivElement>, goToDetail: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    goToDetail()
  }
}

interface ProjectTableNavRowProps {
  gridTemplate: string
  goToDetail: () => void
  children: ReactNode
}

function ProjectTableNavRow({ gridTemplate, goToDetail, children }: ProjectTableNavRowProps) {
  return (
    <GridTableRow
      navigable
      gridTemplate={gridTemplate}
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => handleRowKeyDown(e, goToDetail)}
    >
      {children}
    </GridTableRow>
  )
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
  // ЛК бухгалтера ведёт на свою деталь /requests/:id, остальные — на /projects/:id.
  const detailBase =
    columnView === 'requests' || columnView === 'closed-requests' ? '/requests' : '/projects'
  const goToDetail = () => navigate(`${detailBase}/${project.id}`, { state: backOrigin })

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
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <ProjectStageTableCell stage={project.lastActiveStage} />
          <GridTableCell muted>
            {formatTableDate(project.outsideMag?.transferredAt ?? '')}
          </GridTableCell>
          <GridTableCell muted>{project.outsideMag?.transferredBy || '—'}</GridTableCell>
          <GridTableCell muted>
            {getOutsideMagReasonLabel(project.outsideMag?.reason)}
          </GridTableCell>
          <GridTableCell muted>—</GridTableCell>
        </div>
        <GridTableRowActionCell>{renderRowAction?.(project)}</GridTableRowActionCell>
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'general') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <ProjectStageTableCell stage={project.stage} />
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{project.phone || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableDate(project.createdAt)}</GridTableCell>
        </div>
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closing-general') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{project.phone || '—'}</GridTableCell>
          <ProjectArchivedAtCell project={project} />
        </div>
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closing-economics') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
        <div className="contents">
          <ProjectTitleCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableMoney(resolveSalesTotal(project))}</GridTableCell>
          <GridTableCell muted>{formatTableMoney(resolveNetProfitTotal(project))}</GridTableCell>
          <GridTableCell muted>{formatTableMoney(resolveTotalBonus(project))}</GridTableCell>
        </div>
      </ProjectTableNavRow>
    )
  }

  // Запросы / Закрытые запросы (ЛК бухгалтера) — менеджер без редактирования.
  if (columnView === 'requests') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
          <GridTableCell muted>{project.manager || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableDate(project.createdAt)}</GridTableCell>
        </div>
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closed-requests') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
          <GridTableCell muted>{project.manager || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>
            {formatTableDateTime(project.documentsConfirmedAt ?? '')}
          </GridTableCell>
          <GridTableCell muted>{formatTableDate(project.createdAt)}</GridTableCell>
        </div>
      </ProjectTableNavRow>
    )
  }

  return (
    <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail}>
      <div className="contents">
        <ProjectTitleCell project={project} />
      </div>
      <ProjectManagerCell {...managerCellProps} />
      <div className="contents">
        <GridTableCell muted>{project.company || '—'}</GridTableCell>
        <ProjectStageTableCell stage={project.stage} />
        <GridTableCell muted>{formatTableMoney(resolveSalesTotal(project))}</GridTableCell>
        <GridTableCell muted>{formatTableMoney(resolveNetProfitTotal(project))}</GridTableCell>
        <GridTableCell muted>{formatTableMoney(resolveTotalBonus(project))}</GridTableCell>
      </div>
    </ProjectTableNavRow>
  )
}
