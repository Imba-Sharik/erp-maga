import type { Reminder } from '@/entities/reminder'
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
  isPending?: boolean
  errorMessage?: string | null
  onConfirm: (reminder: Reminder) => void
}

/** Презентационное подтверждение удаления; `onConfirm` инжектит API/локальную логику. */
export function ConfirmDeleteReminderDialog({
  open,
  onOpenChange,
  reminder,
  isPending = false,
  errorMessage = null,
  onConfirm,
}: ConfirmDeleteReminderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Удалить напоминание?</DialogTitle>
          <DialogDescription>
            Напоминание будет удалено. Это действие нельзя отменить.
          </DialogDescription>
          {reminder?.title ? (
            <p className="text-foreground-soft text-sm">Напоминание: {reminder.title}</p>
          ) : null}
        </DialogHeader>
        {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-[10px]"
            disabled={isPending || !reminder}
            onClick={() => reminder && onConfirm(reminder)}
          >
            {isPending ? 'Удаление…' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
