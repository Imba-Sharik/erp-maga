import { Link } from 'react-router-dom'
import { FolderOpen, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { Reminder } from '../model/types'

interface ReminderCardProps {
  reminder: Reminder
  editable?: boolean
  /** Имя отв. менеджера — показываем Руководителю (видит напоминания разных менеджеров). */
  managerName?: string
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
  managerName,
  onEdit,
  onDelete,
  projectHref,
  projectTitle,
  className,
}: ReminderCardProps) {
  return (
    <article
      className={cn(
        'border-draft-highlight/45 bg-card flex flex-col gap-2 rounded-[10px] border p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-sm font-semibold">{reminder.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-muted-foreground text-xs">{reminder.time}</span>
            {reminder.sentAt ? <span className="text-success text-xs">Отправлено</span> : null}
            {projectHref ? (
              <Link
                to={projectHref}
                className="text-info inline-flex max-w-full items-center gap-1 text-xs hover:underline"
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
              className="text-muted-foreground hover:text-foreground"
              aria-label="Редактировать напоминание"
              onClick={() => onEdit?.(reminder)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hover:text-destructive text-muted-foreground"
              aria-label="Удалить напоминание"
              onClick={() => onDelete?.(reminder)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      {reminder.comment ? (
        <p className="text-foreground-soft text-sm wrap-break-word whitespace-pre-wrap">
          {reminder.comment}
        </p>
      ) : null}
      {managerName ? (
        <p className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
          <User className="size-3 shrink-0" />
          <span className="truncate">{managerName}</span>
        </p>
      ) : null}
    </article>
  )
}
