import type { ListRemindersParams, Reminder } from '@/entities/reminder'

import { useDeleteReminder } from '../model/use-calendar-reminders'
import { ConfirmDeleteReminderDialog } from './confirm-delete-reminder-dialog'

export interface DeleteReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reminder: Reminder | null
  queryParams: ListRemindersParams
}

export function DeleteReminderDialog({
  open,
  onOpenChange,
  reminder,
  queryParams,
}: DeleteReminderDialogProps) {
  const { submit, isPending, errorMessage } = useDeleteReminder({
    queryParams,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <ConfirmDeleteReminderDialog
      open={open}
      onOpenChange={onOpenChange}
      reminder={reminder}
      isPending={isPending}
      errorMessage={errorMessage}
      onConfirm={submit}
    />
  )
}
