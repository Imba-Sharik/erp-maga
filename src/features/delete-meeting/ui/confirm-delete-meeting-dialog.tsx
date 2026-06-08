import type { ListMeetingsParams, Meeting } from '@/entities/meeting'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { useDeleteMeeting } from '../model/use-delete-meeting'

export interface ConfirmDeleteMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
  queryParams: ListMeetingsParams
}

export function ConfirmDeleteMeetingDialog({
  open,
  onOpenChange,
  meeting,
  queryParams,
}: ConfirmDeleteMeetingDialogProps) {
  const { submit, isPending, isError, errorMessage, reset } = useDeleteMeeting({
    queryParams,
    onSuccess: () => onOpenChange(false),
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Удалить встречу?</DialogTitle>
          <DialogDescription>
            Встреча будет удалена из календаря. Это действие нельзя отменить.
          </DialogDescription>
          {meeting?.title ? (
            <p className="text-sm text-[#454545]">Встреча: {meeting.title}</p>
          ) : null}
        </DialogHeader>
        {isError && errorMessage ? (
          <p className="text-destructive text-sm">{errorMessage}</p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-[10px]"
            onClick={() => meeting && submit(meeting)}
            disabled={isPending || !meeting}
          >
            {isPending ? 'Удаление…' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
