import type { ListRemindersParams, Reminder } from '@/entities/reminder'

import { useUpdateReminder } from '../model/use-calendar-reminders'
import { ReminderFormDialog } from './reminder-form-dialog'

export interface EditReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reminder: Reminder | null
  queryParams: ListRemindersParams
}

export function EditReminderDialog({
  open,
  onOpenChange,
  reminder,
  queryParams,
}: EditReminderDialogProps) {
  const { update, isPending, errorMessage, reset } = useUpdateReminder({
    queryParams,
    reminder,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <ReminderFormDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
      reminder={reminder}
      isPending={isPending}
      errorMessage={errorMessage}
      onSubmit={update}
    />
  )
}
