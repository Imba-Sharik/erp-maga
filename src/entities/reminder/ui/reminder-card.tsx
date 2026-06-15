import { Link } from 'react-router-dom'
import { FolderOpen, Pencil, Send, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { Reminder } from '../model/types'

interface ReminderCardProps {
  reminder: Reminder
  editable?: boolean
  onEdit?: (reminder: Reminder) => void
  onDelete?: (reminder: Reminder) => void
  /** Ссылка на проект, к которому привязано напоминание (показываем в календаре). */
  projectHref?: string
  projectTitle?: string
  className?: string
}

export function ReminderCard({
  reminder,
  editable = false,
  onEdit,
  onDelete,
  projectHref,
  projectTitle,
  className,
}: ReminderCardProps) {
  return (
    <article
      className={cn(
        'border-draft-highlight/45 flex flex-col gap-2 rounded-[10px] border bg-white p-3',
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
            {projectHref ? (
              <Link
                to={projectHref}
                className="inline-flex max-w-full items-center gap-1 text-xs text-[#4B61B9] hover:underline"
                title={projectTitle}
              >
                <FolderOpen className="size-3 shrink-0" />
                <span className="truncate">{projectTitle ?? 'Открыть проект'}</span>
              </Link>
            ) : null}
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
