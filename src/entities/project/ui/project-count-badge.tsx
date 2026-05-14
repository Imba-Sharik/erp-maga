import { Badge } from '@/shared/ui/badge'
import { pluralProjects } from '../lib/plural'

export function ProjectCountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <Badge
      variant="counter"
      className="gap-1 px-1.5 py-0.5 text-[10px] font-normal @[700px]:gap-1.5 @[700px]:px-2 @max-[560px]/calendar:gap-0.5 @max-[560px]/calendar:px-1"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[#848484] @max-[560px]/calendar:hidden" />
      <span className="hidden @[700px]:inline">
        {count} {pluralProjects(count)}
      </span>
      <span className="@[700px]:hidden">{count}</span>
    </Badge>
  )
}
