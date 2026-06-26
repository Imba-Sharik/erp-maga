import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

interface TimeFieldProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

/** Нативный time input. Хранит значение в формате HH:mm. */
export function TimeField({ value, onChange, className }: TimeFieldProps) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'border-border-strong h-10 rounded-[10px] bg-white text-sm',
        '[&::-webkit-calendar-picker-indicator]:opacity-60',
        className,
      )}
    />
  )
}
