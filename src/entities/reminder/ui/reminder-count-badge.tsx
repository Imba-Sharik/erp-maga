import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { pluralReminders } from '../lib/plural'

/** Жёлтая плашка с количеством напоминаний (цвет драфта проектов). */
export function ReminderCountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <Badge
      className={cn(
        'border-draft-highlight/35 bg-draft-highlight/10 text-draft-highlight-muted',
        'text-2xs gap-1 px-1.5 py-0.5 font-normal',
        '@[700px]:gap-1.5 @[700px]:px-2',
        '@max-[699px]/calendar:aspect-square @max-[699px]/calendar:size-4 @max-[699px]/calendar:max-w-4 @max-[699px]/calendar:min-w-4 @max-[699px]/calendar:gap-0 @max-[699px]/calendar:p-0 @max-[699px]/calendar:leading-none',
        '@max-[560px]/calendar:text-3xs',
      )}
    >
      <span className="bg-draft-highlight size-1.5 shrink-0 rounded-full @max-[699px]/calendar:hidden" />
      <span className="hidden @[700px]:inline">
        {count} {pluralReminders(count)}
      </span>
      <span className="flex size-full items-center justify-center leading-none @[700px]:hidden">
        {count}
      </span>
    </Badge>
  )
}
