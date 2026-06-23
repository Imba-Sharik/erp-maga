import type { ReactNode } from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { Plus } from 'lucide-react'
import {
  getMeetingsForDate,
  MeetingCard,
  type Meeting,
  type MeetingsByDay,
} from '@/entities/meeting'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { DatePill } from '@/shared/ui/date-pill'
import { MeetingDayPanelHeader } from './meeting-day-panel-header'

interface MeetingDayPanelProps {
  selectedDate: Date | null
  meetingsByDay: MeetingsByDay
  /** Показывать кнопку «Добавить встречу». */
  canCreate?: boolean
  /** Можно ли редактировать/удалять конкретную встречу (своя — да). */
  canEditMeeting?: (meeting: Meeting) => boolean
  /** Резолвер имени отв. менеджера по id (для Руководителя). */
  resolveManagerName?: (managerId: number) => string | undefined
  maxHeightPx?: number
  /** Заменяет заголовок панели (напр. табы Встречи/Напоминания). */
  titleSlot?: ReactNode
  onAddMeeting?: () => void
  onEditMeeting?: (meeting: Meeting) => void
  onDeleteMeeting?: (meeting: Meeting) => void
}

export function MeetingDayPanel({
  selectedDate,
  meetingsByDay,
  canCreate = false,
  canEditMeeting,
  resolveManagerName,
  maxHeightPx,
  titleSlot,
  onAddMeeting,
  onEditMeeting,
  onDeleteMeeting,
}: MeetingDayPanelProps) {
  const meetings = selectedDate ? getMeetingsForDate(meetingsByDay, selectedDate) : []
  const heightCapped = maxHeightPx != null && maxHeightPx > 0

  return (
    <div
      className={cn('flex flex-col gap-4', heightCapped && 'min-h-0 overflow-visible')}
      style={heightCapped ? { maxHeight: maxHeightPx } : undefined}
    >
      <MeetingDayPanelHeader
        meetingsCount={meetings.length}
        hasSelectedDate={selectedDate !== null}
        titleSlot={titleSlot}
      />

      <Card
        className={cn(
          'gap-2.5 border-[#B1B1B1] p-2.5 shadow-none',
          heightCapped && 'flex min-h-0 flex-1 flex-col overflow-visible',
        )}
      >
        <OverlayScrollbarsComponent
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: {
              visibility: 'auto',
              autoHide: 'never',
              autoHideDelay: 800,
            },
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
                {canCreate ? (
                  <Button
                    type="button"
                    className="h-10 rounded-[10px] bg-black text-white hover:bg-black/90"
                    onClick={onAddMeeting}
                  >
                    <Plus className="size-4" />
                    Добавить встречу
                  </Button>
                ) : null}
              </div>

              {meetings.length === 0 ? (
                <p className="px-1 py-2 text-sm text-[#ACACAC]">На этот день встреч нет</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {meetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      editable={canEditMeeting?.(meeting) ?? false}
                      managerName={resolveManagerName?.(meeting.managerId)}
                      onEdit={onEditMeeting}
                      onDelete={onDeleteMeeting}
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
