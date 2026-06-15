import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'

import {
  reminderActions,
  ReminderCard,
  sortRemindersByTime,
  useReminders,
  type Reminder,
  type ReminderFormValues,
} from '@/entities/reminder'
import { ConfirmDeleteReminderDialog, ReminderFormDialog } from '@/features/manage-reminders'
import { Button } from '@/shared/ui/button'

interface ProjectRemindersProps {
  projectId: number
  /** Может ли текущая роль создавать/править напоминания */
  editable?: boolean
}

/**
 * Таб «Напоминания» внутри проекта. Менеджер вносит события по проекту,
 * чтобы получать уведомления в ЕРП и (опционально) в Telegram.
 *
 * Бэка под ПРОЕКТНЫЕ напоминания пока нет (есть только user-scoped /reminders/),
 * поэтому таб — визуальная заготовка на локальном сторе.
 */
export function ProjectReminders({ projectId, editable = true }: ProjectRemindersProps) {
  const allReminders = useReminders()
  const reminders = useMemo(() => {
    const forProject = allReminders.filter((r) => r.projectId === projectId)
    return sortRemindersByTime(forProject).sort((a, b) => a.date.localeCompare(b.date))
  }, [allReminders, projectId])

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Reminder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)

  const today = format(new Date(), 'yyyy-MM-dd')

  const handleCreate = (values: ReminderFormValues) => {
    reminderActions.add({
      title: values.title,
      comment: values.comment,
      date: values.date,
      time: values.time,
      notifyTelegram: values.notifyTelegram,
      sentAt: null,
      projectId,
    })
    setCreateOpen(false)
  }

  const handleUpdate = (values: ReminderFormValues) => {
    if (!editTarget) return
    reminderActions.update(editTarget.id, {
      title: values.title,
      comment: values.comment,
      date: values.date,
      time: values.time,
      notifyTelegram: values.notifyTelegram,
    })
    setEditTarget(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#ACACAC]">
          События по проекту с уведомлением в ЕРП и Telegram
        </p>
        {editable ? (
          <Button
            type="button"
            className="h-10 rounded-[10px] bg-black text-white hover:bg-black/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Добавить напоминание
          </Button>
        ) : null}
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-[14px] border border-[#E9E6DD] bg-white px-5 py-8 text-center text-sm text-[#ACACAC]">
          По этому проекту пока нет напоминаний
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              editable={editable}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ReminderFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultDate={today}
        onSubmit={handleCreate}
      />
      <ReminderFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        reminder={editTarget}
        onSubmit={handleUpdate}
      />
      <ConfirmDeleteReminderDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        reminder={deleteTarget}
        onConfirm={(reminder) => {
          reminderActions.remove(reminder.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
