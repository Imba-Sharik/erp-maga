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
  canCreateReminder,
  canModifyReminder,
  CreateReminderDialog,
  DeleteReminderDialog,
  EditReminderDialog,
} from '@/features/manage-reminders'
import { toDayKey } from '@/shared/lib/date'
import { useElementSize } from '@/shared/hooks'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { CombinedCalendar } from '@/widgets/combined-calendar'
import { MeetingDayPanel } from '@/widgets/meeting-day-panel'
import { ReminderDayPanel } from '@/widgets/reminder-day-panel'

import { canCreateMeeting, canModifyMeeting } from '../lib/can-modify-meeting'

const WIDE_LAYOUT_MIN_WRAPPER_PX = 1400

type PanelTab = 'meetings' | 'reminders'

const PANEL_TAB_CLASS =
  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 cursor-pointer rounded-[10px] border border-border-strong bg-white px-4 py-1.5 text-sm font-normal text-foreground-soft data-[state=active]:border-transparent data-[state=active]:shadow-none'

function parseManagerId(value: string | null | undefined): number | null {
  if (!value) return null
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function MeetingsCalendarPage() {
  const role = useUserRole()
  const currentUser = useCurrentUser()
  const showManagerFilter = role === 'director' || role === 'admin'
  // Создавать встречи могут менеджер и руководитель (ERP-183).
  const meetingsCreatable = canCreateMeeting(role)
  // Напоминания видят и менеджер (свои), и Руководитель/админ (менеджеров, с фильтром по менеджеру).
  const showReminders = role === 'manager' || showManagerFilter
  // Создавать напоминания могут менеджер и руководитель (ERP-187); править/удалять — только свои.
  const remindersCreatable = canCreateReminder(role)
  // id текущего пользователя — владельца создаваемых/правимых встреч и напоминаний.
  const ownerId = parseManagerId(currentUser.id)
  const canEditMeeting = useCallback(
    (meeting: Meeting) => canModifyMeeting({ role, ownerId, meeting }),
    [role, ownerId],
  )
  const canEditReminder = useCallback(
    (reminder: Reminder) => canModifyReminder({ role, ownerId, reminder }),
    [role, ownerId],
  )

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
  // Множественный выбор менеджеров (только director/admin). Пустой массив — все менеджеры.
  const [magManagerIds, setMagManagerIds] = useState<string[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Meeting | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null)

  const [reminderCreateOpen, setReminderCreateOpen] = useState(false)
  const [reminderEditTarget, setReminderEditTarget] = useState<Reminder | null>(null)
  const [reminderDeleteTarget, setReminderDeleteTarget] = useState<Reminder | null>(null)

  // Бэк фильтрует только по одному менеджеру, поэтому для руководителя тянем все
  // встречи (manager не передаём) и фильтруем по выбранным id на клиенте.
  // Менеджер всегда скоупится на себя серверным фильтром.
  const queryManagerId = useMemo((): number | null => {
    if (showManagerFilter) return null
    const parsed = parseManagerId(currentUser.id)
    return parsed ?? 1
  }, [showManagerFilter, currentUser.id])

  const selectedManagerIds = useMemo(
    () => new Set(magManagerIds.map(Number).filter((id) => Number.isFinite(id))),
    [magManagerIds],
  )

  // Имя отв. менеджера по id — показываем на карточках только Руководителю/админу.
  // Свои записи (владелец = текущий пользователь) помечаем «Вы».
  const managerNameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const option of managerFilterOptions) map.set(Number(option.value), option.label)
    return map
  }, [managerFilterOptions])
  const resolveManagerName = useCallback(
    (managerId: number) => {
      if (ownerId != null && managerId === ownerId) return 'Вы'
      return managerNameById.get(managerId)
    },
    [managerNameById, ownerId],
  )

  const { dateFrom, dateTo } = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 })
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 })
    return {
      dateFrom: format(gridStart, 'yyyy-MM-dd'),
      dateTo: format(gridEnd, 'yyyy-MM-dd'),
    }
  }, [visibleMonth])

  const queryParams: ListMeetingsParams = useMemo(
    () => ({ dateFrom, dateTo, managerId: queryManagerId }),
    [dateFrom, dateTo, queryManagerId],
  )

  const { data, isLoading, isFetching } = useMeetingsCalendarList(queryParams)

  const visibleMeetings = useMemo(() => {
    const all = data ?? []
    if (!showManagerFilter || selectedManagerIds.size === 0) return all
    return all.filter((meeting) => selectedManagerIds.has(meeting.managerId))
  }, [data, showManagerFilter, selectedManagerIds])

  const meetingsByDay = useMemo(() => groupMeetingsByDay(visibleMeetings), [visibleMeetings])
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
  } = useRemindersCalendarList(reminderQueryParams, { enabled: showReminders })

  // Руководитель видит напоминания менеджеров; при выборе менеджера(ов) — только их
  // (фильтра по менеджеру в API нет, поэтому фильтруем по managerId на клиенте).
  const visibleReminders = useMemo(() => {
    const all = reminderData ?? []
    if (!showManagerFilter || selectedManagerIds.size === 0) return all
    return all.filter((reminder) => selectedManagerIds.has(reminder.managerId))
  }, [reminderData, showManagerFilter, selectedManagerIds])

  const remindersByDay = useMemo(() => groupRemindersByDay(visibleReminders), [visibleReminders])
  const totalRemindersThisMonth = useMemo(
    () => countRemindersInMonth(remindersByDay, visibleMonth),
    [remindersByDay, visibleMonth],
  )

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const selectedDateKey = selectedDate ? toDayKey(selectedDate) : null
  // Владелец оптимистичной встречи = текущий пользователь (менеджер или руководитель).
  const createManagerId = ownerId ?? 1

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
        <h1 className="font-heading text-foreground font-bold">Календарь встреч</h1>
        <p className="text-muted-foreground hidden max-w-160 text-sm md:block">
          Расписание встреч менеджеров
        </p>
      </header>

      <div className="grid gap-6 @min-[1400px]/main:grid-cols-[minmax(0,1fr)_minmax(360px,540px)] @min-[1400px]/main:items-start @min-[1400px]/main:gap-10">
        <div ref={calendarRef} className="min-h-0 min-w-0">
          <CombinedCalendar
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            today={today}
            meetingsByDay={meetingsByDay}
            remindersByDay={remindersByDay}
            onChangeMonth={setVisibleMonth}
            onSelectDate={handleSelectDate}
            showManagerFilter={showManagerFilter}
            magManagerIds={magManagerIds}
            onChangeMagManagerIds={setMagManagerIds}
            managerFilterOptions={managerFilterOptions}
            managersSelectLoading={managersSelectLoading}
            managersSelectError={managersSelectError}
            totalMeetings={totalThisMonth}
            totalReminders={totalRemindersThisMonth}
            isLoading={isLoading || remindersLoading}
            isFetching={isFetching || remindersFetching}
          />
        </div>
        <div className="min-h-0 min-w-0">
          {showReminders && panelTab === 'reminders' ? (
            <ReminderDayPanel
              selectedDate={selectedDate}
              remindersByDay={remindersByDay}
              canCreate={remindersCreatable}
              canEditReminder={canEditReminder}
              resolveManagerName={showManagerFilter ? resolveManagerName : undefined}
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
              canCreate={meetingsCreatable}
              canEditMeeting={canEditMeeting}
              resolveManagerName={showManagerFilter ? resolveManagerName : undefined}
              maxHeightPx={panelMaxHeightPx}
              titleSlot={panelTabs}
              onAddMeeting={() => setCreateOpen(true)}
              onEditMeeting={setEditTarget}
              onDeleteMeeting={setDeleteTarget}
            />
          )}
        </div>
      </div>

      {meetingsCreatable && selectedDate && selectedDateKey ? (
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
          {remindersCreatable && selectedDateKey ? (
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
