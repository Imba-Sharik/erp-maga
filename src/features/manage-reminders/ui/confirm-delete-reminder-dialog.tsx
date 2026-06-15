import { reminderActions, type Reminder } from '@/entities/reminder'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export interface ConfirmDeleteReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reminder: Reminder | null
}

export function ConfirmDeleteReminderDialog({
  open,
  onOpenChange,
  reminder,
}: ConfirmDeleteReminderDialogProps) {
  const handleDelete = () => {
    if (!reminder) return
    reminderActions.remove(reminder.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Удалить напоминание?</DialogTitle>
          <DialogDescription>
            Напоминание будет удалено. Это действие нельзя отменить.
          </DialogDescription>
          {reminder?.title ? (
            <p className="text-sm text-[#454545]">Напоминание: {reminder.title}</p>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-[10px]"
            disabled={!reminder}
            onClick={handleDelete}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
