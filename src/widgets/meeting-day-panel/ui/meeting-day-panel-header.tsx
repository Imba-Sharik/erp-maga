import { pluralMeetings } from '@/entities/meeting'

interface MeetingDayPanelHeaderProps {
  meetingsCount: number
  hasSelectedDate: boolean
}

export function MeetingDayPanelHeader({
  meetingsCount,
  hasSelectedDate,
}: MeetingDayPanelHeaderProps) {
  const subtitle = hasSelectedDate
    ? `${meetingsCount} ${pluralMeetings(meetingsCount)} в этот день`
    : null

  return (
    <div className="flex h-10 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-heading leading-none font-bold text-[#1B1A17]">Встречи</h2>
      {subtitle ? <span className="text-sm text-[#ACACAC]">{subtitle}</span> : null}
    </div>
  )
}
