import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import {
  pluralProjects,
  ProjectPipelineCard,
  type Project,
  type ProjectBackOrigin,
} from '@/entities/project'

const INITIAL_VISIBLE = 25
const STEP = 25

export interface PipelineKanbanColumnProps {
  title: string
  projects: Project[]
  headerAccentClassName: 'bg-funnel-preproject' | 'bg-funnel-closing'
  backOrigin: ProjectBackOrigin
  onLoadMore?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}

export function PipelineKanbanColumn({
  title,
  projects,
  headerAccentClassName,
  backOrigin,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: PipelineKanbanColumnProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

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
    <div className="flex h-full w-70 shrink-0 flex-col @[1400px]:w-auto @[1400px]:min-w-65 @[1400px]:flex-1">
      <div className="bg-card shrink-0">
        <div className="flex flex-col gap-2 px-4 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-[#454545]">{title}</span>
            <span className="shrink-0 text-xs text-[#ACACAC]">{projects.length}</span>
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
            <p className="text-xs text-[#ACACAC]">Пусто</p>
          ) : (
            <>
              {visible.map((p) => (
                <ProjectPipelineCard key={p.id} project={p} backOrigin={backOrigin} />
              ))}
              {showMoreButton && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  disabled={isFetchingNextPage}
                  className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center text-xs text-[#454545] transition-colors hover:bg-[#F4F2EC] disabled:cursor-default disabled:opacity-60"
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
