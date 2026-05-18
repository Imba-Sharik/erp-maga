import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface StageDateFieldProps {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Поповер-датапикер для manager-полей `type: 'date'`. Хранит ISO `yyyy-MM-dd`. */
export function StageDateField({
  value,
  onChange,
  placeholder = 'дд.мм.гггг',
  className,
}: StageDateFieldProps) {
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
            'h-9 w-full justify-between rounded-[10px] border-[#B1B1B1] bg-white px-3 text-left text-sm font-normal',
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
