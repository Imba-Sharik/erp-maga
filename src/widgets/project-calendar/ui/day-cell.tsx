import { ProjectCountBadge } from '@/entities/project'
import { cn } from '@/shared/lib/utils'

interface DayCellProps {
  dayNum: number
  outOfMonth: boolean
  isToday: boolean
  isSelected: boolean
  count: number
  onSelect: () => void
  colIdx: number
  isLastRow: boolean
  isLoading?: boolean
}

export function DayCell({
  dayNum,
  outOfMonth,
  isToday,
  isSelected,
  count,
  onSelect,
  colIdx,
  isLastRow,
  isLoading = false,
}: DayCellProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'min-h-16 cursor-pointer bg-white md:min-h-24',
        '@max-[1100px]/calendar:flex @max-[1100px]/calendar:flex-col @max-[1100px]/calendar:aspect-square @max-[1100px]/calendar:min-h-0 @max-[1100px]/calendar:overflow-hidden',
        outOfMonth && 'bg-[#F3F3F3]',
        colIdx < 6 && 'border-r border-[#D3D3D3]',
        !isLastRow && 'border-b border-[#D3D3D3]',
      )}
    >
      <div
        className={cn(
          'flex min-h-0 flex-col items-start gap-1.5 p-1.5 text-left md:p-2.5',
          'h-full @max-[1100px]/calendar:flex-1',
          '@max-[560px]/calendar:gap-0.5 @max-[560px]/calendar:p-1',
          isSelected &&
            'rounded-[10px] border border-[#ADADAD] bg-linear-to-br from-white to-[#D9D9D9]',
        )}
      >
        <span className="relative shrink-0 inline-flex items-center justify-center">
          {isToday && (
            <span
              className="pointer-events-none absolute top-1/2 left-1/2 h-5.5 w-5.5 min-w-5.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#424242] @max-[560px]/calendar:h-4 @max-[560px]/calendar:w-4 @max-[560px]/calendar:min-w-4 @max-[400px]/calendar:h-3.5 @max-[400px]/calendar:w-3.5 @max-[400px]/calendar:min-w-3.5"
              aria-hidden
            />
          )}
          <span
            className={cn(
              'relative z-10 text-sm leading-none @max-[560px]/calendar:text-3xs',
              isToday ? 'text-white' : 'text-[#1B1A17]',
            )}
          >
            {dayNum}
          </span>
        </span>
        <div className="@max-[1100px]/calendar:flex @max-[1100px]/calendar:min-h-0 @max-[1100px]/calendar:flex-1 @max-[1100px]/calendar:flex-col @max-[1100px]/calendar:items-center @max-[1100px]/calendar:justify-center">
          {isLoading && !outOfMonth ? (
            <span className="h-4 w-12 animate-pulse rounded bg-[#E9E6DD] @max-[560px]/calendar:h-3 @max-[560px]/calendar:w-8" />
          ) : (
            <ProjectCountBadge count={count} />
          )}
        </div>
      </div>
    </button>
  )
}
