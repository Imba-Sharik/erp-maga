import { useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import {
  pluralProjects,
  ProjectPipelineCard,
  type Project,
  type ProjectBackOrigin,
} from '@/entities/project'
import { useCurrentUser } from '@/entities/current-user'
import { draftKey, useStageDrafts } from '@/entities/stage-draft'

const INITIAL_VISIBLE = 25
const STEP = 25

/**
 * Оболочка колонки kanban — отдельная скруглённая карточка (редизайн Figma
 * 108:434): белый фон, рамка #d3d3d3 (border-medium), радиус 20px. Используется
 * и для загруженной колонки, и для placeholder-состояний.
 */
export const COLUMN_SHELL_CLASS =
  'bg-card border-border-medium flex h-full w-70 shrink-0 flex-col overflow-hidden rounded-[20px] border @[1400px]:w-auto @[1400px]:min-w-65 @[1400px]:flex-1'

function columnCountLabel(visible: number, backendTotal: number | undefined): string {
  if (backendTotal === undefined) return String(visible)
  if (visible !== backendTotal) return `${visible} / ${backendTotal}`
  return String(backendTotal)
}

export interface PipelineKanbanColumnProps {
  title: string
  projects: Project[]
  headerAccentClassName: 'bg-funnel-preproject' | 'bg-funnel-closing'
  backOrigin: ProjectBackOrigin
  backendTotalCount?: number
  onLoadMore?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onClaimProject?: (project: Project) => void
  onMoveOutsideMag?: (project: Project) => void
  onChangeManager?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
  renderAssistantMenu?: (project: Project) => ReactNode
}

export function PipelineKanbanColumn({
  title,
  projects,
  headerAccentClassName,
  backOrigin,
  backendTotalCount,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onClaimProject,
  onMoveOutsideMag,
  onChangeManager,
  onDeleteProject,
  renderAssistantMenu,
}: PipelineKanbanColumnProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const drafts = useStageDrafts()
  const currentUser = useCurrentUser()

  const visible = projects.slice(0, visibleCount)
  const cachedRemaining = projects.length - visible.length
  const canFetchMore = Boolean(onLoadMore && hasNextPage)
  const showMoreButton = cachedRemaining > 0 || canFetchMore
  const nextBatch = cachedRemaining > 0 ? Math.min(STEP, cachedRemaining) : STEP

  const handleShowMore = () => {
    setVisibleCount((c) => c + STEP)
    if (cachedRemaining < STEP && canFetchMore && !isFetchingNextPage) {
      onLoadMore?.()
    }
  }

  return (
    <div className={COLUMN_SHELL_CLASS}>
      <div className="bg-card shrink-0">
        <div className="flex flex-col gap-2 px-4 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground-soft truncate text-sm">{title}</span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {columnCountLabel(projects.length, backendTotalCount)}
            </span>
          </div>
          <div className={`h-1.25 rounded-b-[5px] ${headerAccentClassName}`} />
        </div>
      </div>
      <OverlayScrollbarsComponent
        options={{
          overflow: { x: 'hidden', y: 'scroll' },
          scrollbars: {
            visibility: 'auto',
            autoHide: 'leave',
            autoHideDelay: 600,
          },
        }}
        className="min-h-0 flex-1"
      >
        <div className="flex flex-col gap-4 p-4">
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-xs">Пусто</p>
          ) : (
            <>
              {visible.map((p) => (
                <ProjectPipelineCard
                  key={p.id}
                  project={p}
                  backOrigin={backOrigin}
                  hasDraft={Boolean(drafts[draftKey(p.id, currentUser.id)]?.highlightPending)}
                  onClaimProject={onClaimProject}
                  onMoveOutsideMag={onMoveOutsideMag}
                  onChangeManager={onChangeManager}
                  onDeleteProject={onDeleteProject}
                  renderAssistantMenu={renderAssistantMenu}
                />
              ))}
              {showMoreButton && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  disabled={isFetchingNextPage}
                  className="text-foreground-soft hover:bg-surface-muted mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center text-xs transition-colors disabled:cursor-default disabled:opacity-60"
                >
                  {isFetchingNextPage && <Loader2 className="size-3.5 animate-spin" />}
                  Показать ещё {nextBatch} {pluralProjects(nextBatch)}
                </button>
              )}
            </>
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  )
}
