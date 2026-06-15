import { Pencil, Send, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { Reminder } from '../model/types'

interface ReminderCardProps {
  reminder: Reminder
  editable?: boolean
  onEdit?: (reminder: Reminder) => void
  onDelete?: (reminder: Reminder) => void
  className?: string
}

export function ReminderCard({
  reminder,
  editable = false,
  onEdit,
  onDelete,
  className,
}: ReminderCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-[10px] border border-[#E8E8E8] bg-white p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[#1B1A17]">{reminder.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs text-[#848484]">{reminder.time}</span>
            {reminder.notifyTelegram ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#4B61B9]">
                <Send className="size-3" />В Telegram
              </span>
            ) : null}
            {reminder.sentAt ? <span className="text-xs text-[#9AAE8C]">Отправлено</span> : null}
          </div>
        </div>
        {editable ? (
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[#ACACAC] hover:text-[#1B1A17]"
              aria-label="Редактировать напоминание"
              onClick={() => onEdit?.(reminder)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hover:text-destructive text-[#ACACAC]"
              aria-label="Удалить напоминание"
              onClick={() => onDelete?.(reminder)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      {reminder.comment ? (
        <p className="text-sm wrap-break-word whitespace-pre-wrap text-[#454545]">
          {reminder.comment}
        </p>
      ) : null}
    </article>
  )
}
