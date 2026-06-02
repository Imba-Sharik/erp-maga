import { ProjectCountBadge } from '@/entities/project'
import { cn } from '@/shared/lib/utils'

interface DayCellProps {
  dayKey: string
  dayNum: number
  outOfMonth: boolean
  isToday: boolean
  isSelected: boolean
  count: number
  onSelect: () => void
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void
  onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => void
  colIdx: number
  isLastRow: boolean
  isLoading?: boolean
}

export function DayCell({
  dayKey,
  dayNum,
  outOfMonth,
  isToday,
  isSelected,
  count,
  onSelect,
  onPointerDown,
  onPointerEnter,
  colIdx,
  isLastRow,
  isLoading = false,
}: DayCellProps) {
  return (
    <button
      type="button"
      data-day-key={dayKey}
      onClick={onSelect}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      aria-selected={isSelected}
      className={cn(
        'flex w-full cursor-pointer touch-none flex-col bg-white',
        '@min-[1101px]/calendar:min-h-16 @min-[1101px]/calendar:md:min-h-24',
        '@max-[1100px]/calendar:aspect-square @max-[1100px]/calendar:min-h-0 @max-[1100px]/calendar:overflow-hidden',
        outOfMonth && 'bg-[#F3F3F3]',
        colIdx < 6 && 'border-r border-[#D3D3D3]',
        !isLastRow && 'border-b border-[#D3D3D3]',
      )}
    >
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col items-start gap-1.5 p-1.5 text-left md:p-2.5',
          '@max-[560px]/calendar:gap-1 @max-[560px]/calendar:p-1',
          isSelected && 'bg-linear-to-br from-white to-[#D9D9D9]',
        )}
      >
        <span className="relative inline-flex shrink-0 items-center justify-center max-sm:ml-0.5">
          {isToday && (
            <span
              className="pointer-events-none absolute top-1/2 left-1/2 h-5.5 w-5.5 min-w-5.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#424242] @max-[560px]/calendar:h-4 @max-[560px]/calendar:w-4 @max-[560px]/calendar:min-w-4 @max-[400px]/calendar:h-3.5 @max-[400px]/calendar:w-3.5 @max-[400px]/calendar:min-w-3.5"
              aria-hidden
            />
          )}
          <span
            className={cn(
              '@max-[560px]/calendar:text-3xs relative z-10 text-sm leading-none',
              isToday ? 'text-white' : 'text-[#1B1A17]',
            )}
          >
            {dayNum}
          </span>
        </span>
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-start">
          {isLoading && !outOfMonth ? (
            <span
              className={cn(
                'pointer-events-none shrink-0 animate-pulse rounded-full bg-[#EBEBEB]',
                'max-md:aspect-square max-md:size-4 max-md:@max-[400px]/calendar:size-3.5',
                'md:inline-block md:h-5 md:w-10',
              )}
              aria-hidden
            />
          ) : (
            <ProjectCountBadge count={count} />
          )}
        </div>
      </div>
    </button>
  )
}
