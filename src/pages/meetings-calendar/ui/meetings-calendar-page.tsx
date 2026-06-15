import { useCallback, useMemo, useRef, useState } from 'react'
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns'
import { useCurrentUser } from '@/entities/current-user'
import { useManagersDirectory } from '@/entities/manager'
import {
  countMeetingsInMonth,
  groupMeetingsByDay,
  type ListMeetingsParams,
  type Meeting,
  useMeetingsCalendarList,
} from '@/entities/meeting'
import {
  countRemindersInMonth,
  groupRemindersByDay,
  useRemindersCalendarList,
  type ListRemindersParams,
  type Reminder,
} from '@/entities/reminder'
import { useUserRole } from '@/entities/user-role'
import { ConfirmDeleteMeetingDialog } from '@/features/delete-meeting'
import { CreateMeetingDialog } from '@/features/create-meeting'
import { EditMeetingDialog } from '@/features/edit-meeting'
import {
  CreateReminderDialog,
  DeleteReminderDialog,
  EditReminderDialog,
} from '@/features/manage-reminders'
import { toDayKey } from '@/shared/lib/date'
import { useElementSize } from '@/shared/hooks/use-element-size'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { CombinedCalendar } from '@/widgets/combined-calendar'
import { MeetingCalendar } from '@/widgets/meeting-calendar'
import { MeetingDayPanel } from '@/widgets/meeting-day-panel'
import { ReminderDayPanel } from '@/widgets/reminder-day-panel'

const WIDE_LAYOUT_MIN_WRAPPER_PX = 1400

type PanelTab = 'meetings' | 'reminders'

const PANEL_TAB_CLASS =
  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 cursor-pointer rounded-[10px] border border-[#B1B1B1] bg-white px-4 py-1.5 text-sm font-normal text-[#454545] data-[state=active]:border-transparent data-[state=active]:shadow-none'

function parseManagerId(value: string | null | undefined): number | null {
  if (!value) return null
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function MeetingsCalendarPage() {
  const role = useUserRole()
  const currentUser = useCurrentUser()
  const showManagerFilter = role === 'director' || role === 'admin'
  const editable = role === 'manager'
  // Логика напоминаний — только у менеджера. Руководитель/админ видят встречи (с фильтром по менеджеру).
  const showReminders = role === 'manager'

  // Таб справа фильтрует список (встречи/напоминания); по умолчанию — встречи.
  const [panelTab, setPanelTab] = useState<PanelTab>('meetings')

  const {
    filterOptions: managerFilterOptions,
    isLoading: managersSelectLoading,
    isError: managersSelectError,
  } = useManagersDirectory()

  const { today, initialVisibleMonth } = useMemo(() => {
    const now = new Date()
    return { today: now, initialVisibleMonth: startOfMonth(now) }
  }, [])

  const [visibleMonth, setVisibleMonth] = useState(initialVisibleMonth)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [magManagerId, setMagManagerId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Meeting | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null)

  const [reminderCreateOpen, setReminderCreateOpen] = useState(false)
  const [reminderEditTarget, setReminderEditTarget] = useState<Reminder | null>(null)
  const [reminderDeleteTarget, setReminderDeleteTarget] = useState<Reminder | null>(null)

  const filterManagerId = useMemo((): number | null => {
    if (showManagerFilter) return parseManagerId(magManagerId)
    const parsed = parseManagerId(currentUser.id)
    return parsed ?? 1
  }, [showManagerFilter, magManagerId, currentUser.id])

  const { dateFrom, dateTo } = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 })
    return {
      dateFrom: format(gridStart, 'yyyy-MM-dd'),
      dateTo: format(gridEnd, 'yyyy-MM-dd'),
    }
  }, [visibleMonth])

  const queryParams: ListMeetingsParams = useMemo(
    () => ({ dateFrom, dateTo, managerId: filterManagerId }),
    [dateFrom, dateTo, filterManagerId],
  )

  const { data, isLoading, isFetching } = useMeetingsCalendarList(queryParams)

  const meetingsByDay = useMemo(() => groupMeetingsByDay(data ?? []), [data])
  const totalThisMonth = useMemo(
    () => countMeetingsInMonth(meetingsByDay, visibleMonth),
    [meetingsByDay, visibleMonth],
  )

  // Напоминания (user-scoped) с бэка /reminders/calendar/.
  const reminderQueryParams: ListRemindersParams = useMemo(
    () => ({ dateFrom, dateTo }),
    [dateFrom, dateTo],
  )
  const {
    data: reminderData,
    isLoading: remindersLoading,
    isFetching: remindersFetching,
  } = useRemindersCalendarList(reminderQueryParams)
  const remindersByDay = useMemo(() => groupRemindersByDay(reminderData ?? []), [reminderData])
  const totalRemindersThisMonth = useMemo(
    () => countRemindersInMonth(remindersByDay, visibleMonth),
    [remindersByDay, visibleMonth],
  )

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const selectedDateKey = selectedDate ? toDayKey(selectedDate) : null
  const createManagerId = filterManagerId ?? 1

  const pageRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const pageSize = useElementSize(pageRef)
  const calendarSize = useElementSize(calendarRef)
  const isWideCalendarLayout = (pageSize?.width ?? 0) >= WIDE_LAYOUT_MIN_WRAPPER_PX
  const panelMaxHeightPx =
    isWideCalendarLayout && calendarSize?.height ? calendarSize.height : undefined

  const panelTabs = showReminders ? (
    <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as PanelTab)}>
      <TabsList className="h-auto gap-1.5 bg-transparent p-0">
        <TabsTrigger value="meetings" className={PANEL_TAB_CLASS}>
          Встречи
        </TabsTrigger>
        <TabsTrigger value="reminders" className={PANEL_TAB_CLASS}>
          Напоминания
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ) : null

  return (
    <div ref={pageRef} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-heading font-bold text-[#1B1A17]">Календарь встреч</h1>
        <p className="hidden max-w-160 text-sm text-[#ACACAC] md:block">
          Расписание встреч менеджеров
        </p>
      </header>

      <div className="grid gap-6 @min-[1400px]/main:grid-cols-[minmax(0,1fr)_minmax(360px,540px)] @min-[1400px]/main:items-start @min-[1400px]/main:gap-10">
        <div ref={calendarRef} className="min-h-0 min-w-0">
          {showReminders ? (
            <CombinedCalendar
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              today={today}
              meetingsByDay={meetingsByDay}
              remindersByDay={remindersByDay}
              onChangeMonth={setVisibleMonth}
              onSelectDate={handleSelectDate}
              totalMeetings={totalThisMonth}
              totalReminders={totalRemindersThisMonth}
              isLoading={isLoading || remindersLoading}
              isFetching={isFetching || remindersFetching}
            />
          ) : (
            <MeetingCalendar
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              today={today}
              meetingsByDay={meetingsByDay}
              onChangeMonth={setVisibleMonth}
              onSelectDate={handleSelectDate}
              showManagerFilter={showManagerFilter}
              magManagerId={magManagerId}
              onChangeMagManager={setMagManagerId}
              managerFilterOptions={managerFilterOptions}
              managersSelectLoading={managersSelectLoading}
              managersSelectError={managersSelectError}
              totalThisMonth={totalThisMonth}
              isLoading={isLoading}
              isFetching={isFetching}
            />
          )}
        </div>
        <div className="min-h-0 min-w-0">
          {showReminders && panelTab === 'reminders' ? (
            <ReminderDayPanel
              selectedDate={selectedDate}
              remindersByDay={remindersByDay}
              editable={editable}
              maxHeightPx={panelMaxHeightPx}
              titleSlot={panelTabs}
              onAddReminder={() => setReminderCreateOpen(true)}
              onEditReminder={setReminderEditTarget}
              onDeleteReminder={setReminderDeleteTarget}
            />
          ) : (
            <MeetingDayPanel
              selectedDate={selectedDate}
              meetingsByDay={meetingsByDay}
              editable={editable}
              maxHeightPx={panelMaxHeightPx}
              titleSlot={panelTabs}
              onAddMeeting={() => setCreateOpen(true)}
              onEditMeeting={setEditTarget}
              onDeleteMeeting={setDeleteTarget}
            />
          )}
        </div>
      </div>

      {editable && selectedDate && selectedDateKey ? (
        <CreateMeetingDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          date={selectedDateKey}
          managerId={createManagerId}
          queryParams={queryParams}
        />
      ) : null}

      <EditMeetingDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        meeting={editTarget}
        queryParams={queryParams}
      />

      <ConfirmDeleteMeetingDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        meeting={deleteTarget}
        queryParams={queryParams}
      />

      {showReminders ? (
        <>
          {editable && selectedDateKey ? (
            <CreateReminderDialog
              open={reminderCreateOpen}
              onOpenChange={setReminderCreateOpen}
              defaultDate={selectedDateKey}
              queryParams={reminderQueryParams}
            />
          ) : null}

          <EditReminderDialog
            open={reminderEditTarget !== null}
            onOpenChange={(open) => !open && setReminderEditTarget(null)}
            reminder={reminderEditTarget}
            queryParams={reminderQueryParams}
          />

          <DeleteReminderDialog
            open={reminderDeleteTarget !== null}
            onOpenChange={(open) => !open && setReminderDeleteTarget(null)}
            reminder={reminderDeleteTarget}
            queryParams={reminderQueryParams}
          />
        </>
      ) : null}
    </div>
  )
}
