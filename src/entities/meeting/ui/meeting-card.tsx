import { Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { formatMeetingVenueLine } from '../lib/format-meeting-venue'
import type { Meeting } from '../model/types'

interface MeetingCardProps {
  meeting: Meeting
  editable?: boolean
  /** Имя отв. менеджера — показываем Руководителю (видит встречи разных менеджеров). */
  managerName?: string
  onEdit?: (meeting: Meeting) => void
  onDelete?: (meeting: Meeting) => void
  className?: string
}

export function MeetingCard({
  meeting,
  editable = false,
  managerName,
  onEdit,
  onDelete,
  className,
}: MeetingCardProps) {
  const venueLabel = formatMeetingVenueLine(meeting.halls)

  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-[10px] border border-[#E8E8E8] bg-white p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[#1B1A17]">{meeting.title}</h3>
          <p className="text-xs text-[#848484]">{meeting.time}</p>
          {venueLabel ? <p className="text-xs text-[#ACACAC]">{venueLabel}</p> : null}
        </div>
        {editable ? (
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[#ACACAC] hover:text-[#1B1A17]"
              aria-label="Редактировать встречу"
              onClick={() => onEdit?.(meeting)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hover:text-destructive text-[#ACACAC]"
              aria-label="Удалить встречу"
              onClick={() => onDelete?.(meeting)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      <p className="text-sm wrap-break-word whitespace-pre-wrap text-[#454545]">{meeting.comment}</p>
      {managerName ? (
        <p className="flex items-center justify-end gap-1 text-xs text-[#848484]">
          <User className="size-3 shrink-0" />
          <span className="truncate">{managerName}</span>
        </p>
      ) : null}
    </article>
  )
}
