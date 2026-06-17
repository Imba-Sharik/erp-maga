import type { KeyboardEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ManagerSelectOption } from '@/entities/manager'
import {
  getOutsideMagReasonLabel,
  projectDetailPath,
  ProjectPlumStatusTableCell,
  type Project,
  type ProjectBackOrigin,
} from '@/entities/project'
import { stageRowHighlightClass, useProjectDraftHighlight } from '@/entities/stage-draft'
import { GridTableCell, GridTableRow, GridTableRowActionCell } from '@/shared/ui/grid-table'

import type { ProjectsTableColumnView } from '../lib/economics-columns'
import {
  formatTableMoney,
  resolveNetProfitTotal,
  resolveSalesTotal,
  resolveTotalBonus,
} from '../lib/economics-columns'
import { getTableGridTemplate, resolveTableWithActions } from '../lib/table-columns'
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

function stopRowNavigation(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

function handleRowKeyDown(e: KeyboardEvent<HTMLDivElement>, goToDetail: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    goToDetail()
  }
}

interface ProjectTableNavRowProps {
  gridTemplate: string
  goToDetail: () => void
  hasDraft?: boolean
  children: ReactNode
}

function ProjectTableNavRow({
  gridTemplate,
  goToDetail,
  hasDraft,
  children,
}: ProjectTableNavRowProps) {
  return (
    <GridTableRow
      navigable
      gridTemplate={gridTemplate}
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => handleRowKeyDown(e, goToDetail)}
      className={stageRowHighlightClass(hasDraft)}
    >
      {children}
    </GridTableRow>
  )
}

export interface ProjectsTableRowManagerProps {
  directoryOptions: ManagerSelectOption[]
  assignmentOptionsLoading?: boolean
  assignmentOptionsError?: boolean
  showHallAssignmentHint?: boolean
  managerEditable?: boolean
  isEditingManager: boolean
  onStartEditManager: () => void
  onAssignManager: (managerId: string) => void
  onCancelEditManager: () => void
  assignDisabled?: boolean
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
  directoryOptions,
  assignmentOptionsLoading = false,
  assignmentOptionsError = false,
  showHallAssignmentHint = false,
  managerEditable = true,
  isEditingManager,
  onStartEditManager,
  onAssignManager,
  onCancelEditManager,
  assignDisabled,
}: ProjectsTableRowProps) {
  const navigate = useNavigate()
  const hasDraft = useProjectDraftHighlight(project.id)
  const withActions = resolveTableWithActions(columnView, renderRowAction)
  const gridTemplate = getTableGridTemplate(columnView, { withActions })
  const goToDetail = () =>
    navigate(projectDetailPath(project.id, backOrigin), { state: backOrigin })

  const managerCellProps: ProjectManagerCellProps = {
    manager: project.manager,
    directoryOptions,
    optionsLoading: assignmentOptionsLoading,
    optionsError: assignmentOptionsError,
    showHallAssignmentHint,
    editable: managerEditable,
    isEditing: isEditingManager,
    onStartEdit: onStartEditManager,
    onAssign: onAssignManager,
    onCancelEdit: onCancelEditManager,
    assignDisabled,
  }

  if (columnView === 'outside-mag') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <ProjectStageTableCell stage={project.lastActiveStage} />
          <ProjectPlumStatusTableCell project={project} />
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
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
        </div>
        <ProjectManagerCell {...managerCellProps} />
        <div className="contents">
          <ProjectStageTableCell stage={project.stage} />
          <ProjectPlumStatusTableCell project={project} />
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{project.phone || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableDate(project.createdAt)}</GridTableCell>
        </div>
        {renderRowAction ? (
          <GridTableRowActionCell>{renderRowAction(project)}</GridTableRowActionCell>
        ) : null}
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closing-active') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectHallCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectPlumStatusTableCell project={project} />
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>
            <span className="flex w-full min-w-0 items-center gap-1.5">
              {renderRowAction ? (
                <span
                  className="shrink-0"
                  onClick={stopRowNavigation}
                  onPointerDown={stopRowNavigation}
                >
                  {renderRowAction(project)}
                </span>
              ) : null}
              <span className="min-w-0 truncate" title={project.manager || '—'}>
                {project.manager || '—'}
              </span>
            </span>
          </GridTableCell>
          <GridTableCell muted>{project.type || '—'}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{project.phone || '—'}</GridTableCell>
        </div>
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closing-general') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
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
        {renderRowAction ? (
          <GridTableRowActionCell>{renderRowAction(project)}</GridTableRowActionCell>
        ) : null}
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closing-economics') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
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
        {renderRowAction ? (
          <GridTableRowActionCell>{renderRowAction(project)}</GridTableRowActionCell>
        ) : null}
      </ProjectTableNavRow>
    )
  }

  // Запросы / Закрытые запросы (ЛК бухгалтера) — менеджер без редактирования.
  if (columnView === 'requests') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
          <GridTableCell muted>{project.manager || '—'}</GridTableCell>
          <ProjectPlumStatusTableCell project={project} />
          <GridTableCell muted>{formatTableDate(project.date)}</GridTableCell>
          <GridTableCell muted>{project.company || '—'}</GridTableCell>
          <GridTableCell muted>{formatTableDate(project.createdAt)}</GridTableCell>
        </div>
      </ProjectTableNavRow>
    )
  }

  if (columnView === 'closed-requests') {
    return (
      <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
        <div className="contents">
          <ProjectTitleCell project={project} />
          <ProjectLoftCell project={project} />
          <ProjectHallCell project={project} />
          <GridTableCell muted>{project.manager || '—'}</GridTableCell>
          <ProjectPlumStatusTableCell project={project} />
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
    <ProjectTableNavRow gridTemplate={gridTemplate} goToDetail={goToDetail} hasDraft={hasDraft}>
      <div className="contents">
        <ProjectTitleCell project={project} />
      </div>
      <ProjectManagerCell {...managerCellProps} />
      <div className="contents">
        <GridTableCell muted>{project.company || '—'}</GridTableCell>
        <ProjectStageTableCell stage={project.stage} />
        <ProjectPlumStatusTableCell project={project} />
        <GridTableCell muted>{formatTableMoney(resolveSalesTotal(project))}</GridTableCell>
        <GridTableCell muted>{formatTableMoney(resolveNetProfitTotal(project))}</GridTableCell>
        <GridTableCell muted>{formatTableMoney(resolveTotalBonus(project))}</GridTableCell>
      </div>
      {renderRowAction ? (
        <GridTableRowActionCell>{renderRowAction(project)}</GridTableRowActionCell>
      ) : null}
    </ProjectTableNavRow>
  )
}
