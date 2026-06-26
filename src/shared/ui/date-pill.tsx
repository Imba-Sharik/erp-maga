import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/shared/lib/utils'

interface DatePillProps {
  date: Date
  className?: string
}

export function DatePill({ date, className }: DatePillProps) {
  return (
    <div
      className={cn(
        'border-border-strong text-foreground inline-flex h-10 w-fit items-center rounded-[10px] border bg-white px-3.5 text-sm font-semibold',
        className,
      )}
    >
      {format(date, 'd MMMM yyyy', { locale: ru })}
    </div>
  )
}
