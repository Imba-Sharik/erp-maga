import type { ReactNode } from 'react'
import { pluralMeetings } from '@/entities/meeting'

interface MeetingDayPanelHeaderProps {
  meetingsCount: number
  hasSelectedDate: boolean
  /** Заменяет заголовок «Встречи» (напр. на табы Встречи/Напоминания). */
  titleSlot?: ReactNode
}

export function MeetingDayPanelHeader({
  meetingsCount,
  hasSelectedDate,
  titleSlot,
}: MeetingDayPanelHeaderProps) {
  const subtitle = hasSelectedDate
    ? `${meetingsCount} ${pluralMeetings(meetingsCount)} в этот день`
    : null

  return (
    <div className="flex min-h-10 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      {titleSlot ?? (
        <h2 className="font-heading text-foreground leading-none font-bold">Встречи</h2>
      )}
      {subtitle ? <span className="text-muted-foreground text-sm">{subtitle}</span> : null}
    </div>
  )
}
