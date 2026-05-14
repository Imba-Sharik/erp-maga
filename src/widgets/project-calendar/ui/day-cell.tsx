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
}: DayCellProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'min-h-16 cursor-pointer bg-white md:min-h-24',
        '@max-[1100px]/calendar:aspect-square @max-[1100px]/calendar:min-h-0',
        outOfMonth && 'bg-[#F3F3F3]',
        colIdx < 6 && 'border-r border-[#D3D3D3]',
        !isLastRow && 'border-b border-[#D3D3D3]',
      )}
    >
      <div
        className={cn(
          'flex h-full flex-col items-start gap-1.5 p-1.5 text-left md:p-2.5',
          '@max-[560px]/calendar:gap-0.5 @max-[560px]/calendar:p-1',
          isSelected &&
            'rounded-[10px] border border-[#ADADAD] bg-linear-to-br from-white to-[#D9D9D9]',
        )}
      >
        {isToday ? (
          <span className="inline-flex h-7.5 min-w-7.5 items-center justify-center rounded-full bg-[#424242] px-1.5 text-xs leading-none text-white @max-[560px]/calendar:h-5 @max-[560px]/calendar:min-w-5 @max-[560px]/calendar:px-1 @max-[560px]/calendar:text-[10px]">
            {dayNum}
          </span>
        ) : (
          <span className="text-sm leading-none text-[#1B1A17] @max-[560px]/calendar:text-xs">
            {dayNum}
          </span>
        )}
        <ProjectCountBadge count={count} />
      </div>
    </button>
  )
}
