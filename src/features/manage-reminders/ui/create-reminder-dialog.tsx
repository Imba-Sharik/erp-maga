import type { ListRemindersParams } from '@/entities/reminder'

import { useCreateReminder } from '../model/use-calendar-reminders'
import { ReminderFormDialog } from './reminder-form-dialog'

export interface CreateReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  queryParams: ListRemindersParams
}

export function CreateReminderDialog({
  open,
  onOpenChange,
  defaultDate,
  queryParams,
}: CreateReminderDialogProps) {
  const { create, isPending, errorMessage, reset } = useCreateReminder({
    queryParams,
    onSuccess: () => onOpenChange(false),
  })

  return (
    <ReminderFormDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
      defaultDate={defaultDate}
      isPending={isPending}
      errorMessage={errorMessage}
      onSubmit={create}
    />
  )
}
