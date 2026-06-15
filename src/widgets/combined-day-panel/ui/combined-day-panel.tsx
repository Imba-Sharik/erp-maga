import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { Plus } from 'lucide-react'
import {
  getMeetingsForDate,
  MeetingCard,
  pluralMeetings,
  type Meeting,
  type MeetingsByDay,
} from '@/entities/meeting'
import {
  getRemindersForDate,
  pluralReminders,
  ReminderCard,
  type Reminder,
  type RemindersByDay,
} from '@/entities/reminder'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { DatePill } from '@/shared/ui/date-pill'

interface CombinedDayPanelProps {
  selectedDate: Date | null
  meetingsByDay: MeetingsByDay
  remindersByDay: RemindersByDay
  editable?: boolean
  maxHeightPx?: number
  onAddMeeting?: () => void
  onAddReminder?: () => void
  onEditMeeting?: (meeting: Meeting) => void
  onDeleteMeeting?: (meeting: Meeting) => void
  onEditReminder?: (reminder: Reminder) => void
  onDeleteReminder?: (reminder: Reminder) => void
}

type MixedItem =
  | { kind: 'meeting'; time: string; meeting: Meeting }
  | { kind: 'reminder'; time: string; reminder: Reminder }

export function CombinedDayPanel({
  selectedDate,
  meetingsByDay,
  remindersByDay,
  editable = false,
  maxHeightPx,
  onAddMeeting,
  onAddReminder,
  onEditMeeting,
  onDeleteMeeting,
  onEditReminder,
  onDeleteReminder,
}: CombinedDayPanelProps) {
  const meetings = selectedDate ? getMeetingsForDate(meetingsByDay, selectedDate) : []
  const reminders = selectedDate ? getRemindersForDate(remindersByDay, selectedDate) : []

  const items: MixedItem[] = [
    ...meetings.map((meeting): MixedItem => ({ kind: 'meeting', time: meeting.time, meeting })),
    ...reminders.map(
      (reminder): MixedItem => ({ kind: 'reminder', time: reminder.time, reminder }),
    ),
  ].sort((a, b) => a.time.localeCompare(b.time))

  const heightCapped = maxHeightPx != null && maxHeightPx > 0
  const subtitle =
    selectedDate !== null
      ? `${meetings.length} ${pluralMeetings(meetings.length)} · ${reminders.length} ${pluralReminders(reminders.length)}`
      : null

  return (
    <div
      className={cn('flex flex-col gap-4', heightCapped && 'min-h-0 overflow-visible')}
      style={heightCapped ? { maxHeight: maxHeightPx } : undefined}
    >
      <div className="flex h-10 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading leading-none font-bold text-[#1B1A17]">Встречи и напоминания</h2>
        {subtitle ? <span className="text-sm text-[#ACACAC]">{subtitle}</span> : null}
      </div>

      <Card
        className={cn(
          'gap-2.5 border-[#B1B1B1] p-2.5 shadow-none',
          heightCapped && 'flex min-h-0 flex-1 flex-col overflow-visible',
        )}
      >
        <OverlayScrollbarsComponent
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: { visibility: 'auto', autoHide: 'never', autoHideDelay: 800 },
          }}
          className={cn('meeting-day-panel-scroll-area', heightCapped && 'min-h-0 flex-1')}
        >
          {!selectedDate ? (
            <p className="px-1 py-4 text-sm text-[#ACACAC]">Выберите один день в календаре слева.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <DatePill date={selectedDate} />
                {editable ? (
                  <>
                    <Button
                      type="button"
                      className="h-10 rounded-[10px] bg-black text-white hover:bg-black/90"
                      onClick={onAddMeeting}
                    >
                      <Plus className="size-4" />
                      Добавить встречу
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-[10px] border-[#B1B1B1]"
                      onClick={onAddReminder}
                    >
                      <Plus className="size-4" />
                      Добавить напоминание
                    </Button>
                  </>
                ) : null}
              </div>

              {items.length === 0 ? (
                <p className="px-1 py-2 text-sm text-[#ACACAC]">
                  На этот день встреч и напоминаний нет
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {items.map((item) =>
                    item.kind === 'meeting' ? (
                      <MeetingCard
                        key={`m-${item.meeting.id}`}
                        meeting={item.meeting}
                        editable={editable}
                        onEdit={onEditMeeting}
                        onDelete={onDeleteMeeting}
                      />
                    ) : (
                      <ReminderCard
                        key={`r-${item.reminder.id}`}
                        reminder={item.reminder}
                        editable={editable && !item.reminder.sentAt}
                        onEdit={onEditReminder}
                        onDelete={onDeleteReminder}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </OverlayScrollbarsComponent>
      </Card>
    </div>
  )
}
