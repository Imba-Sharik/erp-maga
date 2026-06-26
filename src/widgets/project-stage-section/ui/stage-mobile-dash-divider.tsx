import { cn } from '@/shared/lib/utils'

interface StageMobileDashDividerProps {
  className?: string
  hideFrom?: '640' | '900'
}

export function StageMobileDashDivider({
  className,
  hideFrom = '640',
}: StageMobileDashDividerProps) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(
        'border-border-medium h-px w-full border-t border-dashed',
        hideFrom === '900' ? '@[900px]:hidden' : '@[640px]:hidden',
        className,
      )}
    />
  )
}
