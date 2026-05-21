import { Skeleton } from '@/shared/ui/skeleton'

interface GridTableSkeletonProps {
  columnCount: number
  gridTemplate: string
  rowCount?: number
}

export function GridTableSkeleton({
  columnCount,
  gridTemplate,
  rowCount = 10,
}: GridTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, row) => (
        <div key={row} className="grid items-center" style={{ gridTemplateColumns: gridTemplate }}>
          {Array.from({ length: columnCount }).map((__, col) => (
            <div key={col} className="px-3 py-3.5">
              <Skeleton className="h-3.5 w-full max-w-30" />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
