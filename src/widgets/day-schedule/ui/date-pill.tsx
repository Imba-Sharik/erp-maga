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
        'inline-flex h-10 w-fit items-center rounded-[10px] border border-[#B1B1B1] bg-white px-3.5 text-sm font-semibold text-[#1B1A17]',
        className,
      )}
    >
      {format(date, 'd MMMM yyyy', { locale: ru })}
    </div>
  )
}
