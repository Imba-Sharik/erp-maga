import { Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { getCalendarEventTypeLabel, getCalendarEventTypeTagClass } from '@/shared/constants'
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
  const eventTypeLabel = getCalendarEventTypeLabel(meeting.eventType)
  const eventTypeTagClass = getCalendarEventTypeTagClass(meeting.eventType)

  return (
    <article
      className={cn(
        'border-border bg-card flex flex-col gap-2 rounded-[10px] border p-3',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-sm font-semibold">{meeting.title}</h3>
          <p className="text-muted-foreground text-xs">{meeting.time}</p>
          {venueLabel ? <p className="text-muted-foreground text-xs">{venueLabel}</p> : null}
        </div>
        {editable ? (
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Редактировать встречу"
              onClick={() => onEdit?.(meeting)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hover:text-destructive text-muted-foreground"
              aria-label="Удалить встречу"
              onClick={() => onDelete?.(meeting)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      <p className="text-foreground-soft text-sm wrap-break-word whitespace-pre-wrap">
        {meeting.comment}
      </p>
      {eventTypeLabel || managerName ? (
        <div className="flex items-center justify-between gap-2">
          {eventTypeLabel ? (
            <Badge className={eventTypeTagClass}>{eventTypeLabel}</Badge>
          ) : (
            <span />
          )}
          {managerName ? (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <User className="size-3 shrink-0" />
              <span className="truncate">{managerName}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
