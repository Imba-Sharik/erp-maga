import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { Plus } from 'lucide-react'
import {
  getRemindersForDate,
  pluralReminders,
  ReminderCard,
  sortRemindersByTime,
  type Reminder,
  type RemindersByDay,
} from '@/entities/reminder'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { DatePill } from '@/shared/ui/date-pill'

interface ReminderDayPanelProps {
  selectedDate: Date | null
  remindersByDay: RemindersByDay
  editable?: boolean
  maxHeightPx?: number
  onAddReminder?: () => void
  onEditReminder?: (reminder: Reminder) => void
  onDeleteReminder?: (reminder: Reminder) => void
}

export function ReminderDayPanel({
  selectedDate,
  remindersByDay,
  editable = false,
  maxHeightPx,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
}: ReminderDayPanelProps) {
  const reminders = selectedDate
    ? sortRemindersByTime(getRemindersForDate(remindersByDay, selectedDate))
    : []
  const heightCapped = maxHeightPx != null && maxHeightPx > 0
  const subtitle =
    selectedDate !== null
      ? `${reminders.length} ${pluralReminders(reminders.length)} в этот день`
      : null

  return (
    <div
      className={cn('flex flex-col gap-4', heightCapped && 'min-h-0 overflow-visible')}
      style={heightCapped ? { maxHeight: maxHeightPx } : undefined}
    >
      <div className="flex h-10 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading leading-none font-bold text-[#1B1A17]">Напоминания</h2>
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
            <p className="px-1 py-4 text-sm text-[#ACACAC]">
              Выберите один день в календаре слева.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <DatePill date={selectedDate} />
                {editable ? (
                  <Button
                    type="button"
                    className="h-10 rounded-[10px] bg-black text-white hover:bg-black/90"
                    onClick={onAddReminder}
                  >
                    <Plus className="size-4" />
                    Добавить напоминание
                  </Button>
                ) : null}
              </div>

              {reminders.length === 0 ? (
                <p className="px-1 py-2 text-sm text-[#ACACAC]">На этот день напоминаний нет</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {reminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      editable={editable && !reminder.sentAt}
                      onEdit={onEditReminder}
                      onDelete={onDeleteReminder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </OverlayScrollbarsComponent>
      </Card>
    </div>
  )
}
