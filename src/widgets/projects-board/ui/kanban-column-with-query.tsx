import { useMemo, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

import type { Project, ProjectBackOrigin } from '@/entities/project'
import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import { filterProjects, type ProjectsFilter } from '../lib/filter-projects'
import type { BoardListParams, KanbanBoardScope } from '../lib/kanban-board-query'
import { useKanbanColumnQuery } from '../lib/use-kanban-column-query'
import { PipelineKanbanColumn } from './pipeline-kanban-column'
import { ProjectsKanbanColumn } from './projects-kanban-column'

interface KanbanColumnWithQueryBaseProps {
  scope: KanbanBoardScope
  apiStage: StageEnum
  title: string
  listParams: BoardListParams
  filter: ProjectsFilter
  filtersActive: boolean
  onMoveOutsideMag?: (project: Project) => void
  onChangeManager?: (project: Project) => void
}

interface PreprojectKanbanColumnProps extends KanbanColumnWithQueryBaseProps {
  variant: 'preproject'
}

interface ClosingKanbanColumnProps extends KanbanColumnWithQueryBaseProps {
  variant: 'closing'
  backOrigin: ProjectBackOrigin
}

export type KanbanColumnWithQueryProps = PreprojectKanbanColumnProps | ClosingKanbanColumnProps

const COLUMN_SHELL_CLASS =
  'flex h-full w-70 shrink-0 flex-col @[1400px]:w-auto @[1400px]:min-w-65 @[1400px]:flex-1'

export function KanbanColumnWithQuery(props: KanbanColumnWithQueryProps) {
  const { scope, apiStage, title, listParams, filter, filtersActive } = props
  const query = useKanbanColumnQuery({ scope, apiStage, listParams })

  const filtered = useMemo(() => filterProjects(query.projects, filter), [query.projects, filter])

  const columnProps = {
    title,
    projects: filtered,
    backendTotalCount: filtersActive ? undefined : query.totalCount,
    filtersActive,
    onLoadMore: () => query.fetchNextPage(),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    onMoveOutsideMag: props.onMoveOutsideMag,
    onChangeManager: props.onChangeManager,
  }

  const accentClassName =
    props.variant === 'preproject' ? 'bg-funnel-preproject' : 'bg-funnel-closing'

  if (query.isLoading) {
    return (
      <KanbanColumnPlaceholder title={title} accentClassName={accentClassName}>
        <Loader2 className="size-4 animate-spin text-[#ACACAC]" />
        <span className="text-xs text-[#ACACAC]">Загружаем…</span>
      </KanbanColumnPlaceholder>
    )
  }

  if (query.isError) {
    return (
      <KanbanColumnPlaceholder title={title} accentClassName={accentClassName}>
        <p className="text-xs text-red-600">Не удалось загрузить колонку.</p>
      </KanbanColumnPlaceholder>
    )
  }

  if (props.variant === 'preproject') {
    return <ProjectsKanbanColumn {...columnProps} />
  }

  return (
    <PipelineKanbanColumn
      {...columnProps}
      headerAccentClassName="bg-funnel-closing"
      backOrigin={props.backOrigin}
    />
  )
}

function KanbanColumnPlaceholder({
  title,
  accentClassName,
  children,
}: {
  title: string
  accentClassName: string
  children: ReactNode
}) {
  return (
    <div className={COLUMN_SHELL_CLASS}>
      <div className="bg-card shrink-0">
        <div className="flex flex-col gap-2 px-4 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-[#454545]">{title}</span>
          </div>
          <div className={`h-1.25 rounded-b-[5px] ${accentClassName}`} />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">{children}</div>
    </div>
  )
}
