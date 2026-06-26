import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface DateFieldProps {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Поповер-датапикер. Хранит ISO `yyyy-MM-dd`. */
export function DateField({
  value,
  onChange,
  placeholder = 'дд.мм.гггг',
  className,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const parsed = value ? parseISO(value) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined
  const label = selected ? format(selected, 'dd.MM.yyyy', { locale: ru }) : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'border-border-strong h-10! w-full min-w-0 justify-between rounded-[10px] bg-white px-3 text-left text-sm font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <CalendarIcon className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? new Date()}
          locale={ru}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : '')
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
