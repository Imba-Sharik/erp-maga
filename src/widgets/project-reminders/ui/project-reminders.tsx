import { useState } from 'react'
import { format } from 'date-fns'
import { Loader2, Plus } from 'lucide-react'

import { ReminderCard, useProjectRemindersList, type Reminder } from '@/entities/reminder'
import {
  ConfirmDeleteReminderDialog,
  ReminderFormDialog,
  useProjectReminders,
} from '@/features/manage-reminders'
import { Button } from '@/shared/ui/button'

interface ProjectRemindersProps {
  projectId: number
  /** Может ли текущая роль создавать/править напоминания */
  editable?: boolean
}

/**
 * Таб «Напоминания» внутри проекта. Менеджер вносит события по проекту,
 * чтобы получать уведомления в ЕРП и (опционально) в Telegram.
 * Данные — на бэке (`/reminders/?project=`), привязка через `project_id`.
 */
export function ProjectReminders({ projectId, editable = true }: ProjectRemindersProps) {
  const { data: reminders, isLoading, isError } = useProjectRemindersList(projectId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Reminder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)

  const { create, update, remove, isCreating, isUpdating, isDeleting, createError, updateError, deleteError } =
    useProjectReminders({
      projectId,
      onCreated: () => setCreateOpen(false),
      onUpdated: () => setEditTarget(null),
      onDeleted: () => setDeleteTarget(null),
    })

  const today = format(new Date(), 'yyyy-MM-dd')

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

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-[14px] border border-[#E9E6DD] bg-white px-5 py-8 text-sm text-[#ACACAC]">
          <Loader2 className="size-4 animate-spin" />
          Загрузка…
        </div>
      ) : isError ? (
        <div className="rounded-[14px] border border-[#E9E6DD] bg-white px-5 py-8 text-center text-sm text-[#D25252]">
          Не удалось загрузить напоминания
        </div>
      ) : !reminders || reminders.length === 0 ? (
        <div className="rounded-[14px] border border-[#E9E6DD] bg-white px-5 py-8 text-center text-sm text-[#ACACAC]">
          По этому проекту пока нет напоминаний
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              editable={editable && !reminder.sentAt}
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
        isPending={isCreating}
        errorMessage={createError}
        onSubmit={create}
      />
      <ReminderFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        reminder={editTarget}
        isPending={isUpdating}
        errorMessage={updateError}
        onSubmit={(values) => editTarget && update(editTarget.id, values)}
      />
      <ConfirmDeleteReminderDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        reminder={deleteTarget}
        isPending={isDeleting}
        errorMessage={deleteError}
        onConfirm={(reminder) => remove(reminder.id)}
      />
    </div>
  )
}
