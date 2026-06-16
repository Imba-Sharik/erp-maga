import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from 'overlayscrollbars-react'

import { Card } from '@/shared/ui/card'

import { GridTableSkeleton } from './grid-table-skeleton'

interface GridTableViewProps {
  minWidth: string
  gridTemplate: string
  header: ReactNode
  children: ReactNode
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  emptyMessage?: string
  isEmpty?: boolean
  skeletonColumnCount?: number
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  scrollAreaClassName?: string
}

const DEFAULT_SCROLL_AREA_CLASS = 'projects-table-scroll-area min-h-0 flex-1'

export function GridTableView({
  minWidth,
  gridTemplate,
  header,
  children,
  isLoading = false,
  isError = false,
  errorMessage = 'Не удалось загрузить данные.',
  emptyMessage = 'Данные не найдены.',
  isEmpty = false,
  skeletonColumnCount,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  scrollAreaClassName = DEFAULT_SCROLL_AREA_CLASS,
}: GridTableViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<OverlayScrollbarsComponentRef>(null)
  const observerCleanupRef = useRef<(() => void) | null>(null)

  const setupInfiniteScrollObserver = useCallback(() => {
    observerCleanupRef.current?.()
    observerCleanupRef.current = null

    const el = sentinelRef.current
    if (!el || !hasNextPage || !onLoadMore) return

    const viewport = scrollAreaRef.current?.osInstance()?.elements().viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      viewport ? { root: viewport, rootMargin: '120px' } : undefined,
    )
    observer.observe(el)
    observerCleanupRef.current = () => observer.disconnect()
  }, [hasNextPage, onLoadMore])

  useEffect(() => {
    setupInfiniteScrollObserver()
    const raf = requestAnimationFrame(setupInfiniteScrollObserver)
    return () => {
      cancelAnimationFrame(raf)
      observerCleanupRef.current?.()
      observerCleanupRef.current = null
    }
  }, [setupInfiniteScrollObserver, isLoading, isEmpty, isError])

  const handleScrollAreaInitialized = useCallback(() => {
    setupInfiniteScrollObserver()
  }, [setupInfiniteScrollObserver])

  return (
    <Card className="flex max-h-full min-h-0 flex-col gap-0 overflow-visible border-[#B1B1B1] py-0 shadow-none">
      <OverlayScrollbarsComponent
        ref={scrollAreaRef}
        events={{ initialized: handleScrollAreaInitialized }}
        options={{
          overflow: { x: 'scroll', y: 'scroll' },
          scrollbars: {
            visibility: 'auto',
            autoHide: 'never',
            autoHideDelay: 800,
          },
        }}
        className={scrollAreaClassName}
      >
        <div style={{ minWidth }}>
          <div
            className="sticky top-0 z-10 grid items-center border-b border-[#D3D3D3] bg-white"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {header}
          </div>

          {isLoading ? (
            <GridTableSkeleton columnCount={skeletonColumnCount ?? 1} gridTemplate={gridTemplate} />
          ) : isError ? (
            <div className="flex h-40 items-center justify-center px-4 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : isEmpty ? (
            <div className="flex h-40 items-center justify-center px-4 text-sm text-[#ACACAC]">
              {emptyMessage}
            </div>
          ) : (
            <>
              {children}
              {hasNextPage && (
                <div
                  ref={sentinelRef}
                  className="flex h-12 items-center justify-center text-[#ACACAC]"
                >
                  {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                </div>
              )}
            </>
          )}
        </div>
      </OverlayScrollbarsComponent>
    </Card>
  )
}
