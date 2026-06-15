import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { pluralMeetings } from '../lib/plural'

export function MeetingCountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <Badge
      variant="counter"
      className={cn(
        'text-2xs gap-1 px-1.5 py-0.5 font-normal',
        '@[700px]:gap-1.5 @[700px]:px-2',
        'max-md:aspect-square max-md:size-4 max-md:max-w-4 max-md:min-w-4 max-md:gap-0 max-md:p-0 max-md:leading-none',
        '@max-[560px]/calendar:text-3xs',
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[#848484] max-md:hidden" />
      <span className="hidden @[700px]:inline">
        {count} {pluralMeetings(count)}
      </span>
      <span className="flex size-full items-center justify-center leading-none @[700px]:hidden">
        {count}
      </span>
    </Badge>
  )
}
