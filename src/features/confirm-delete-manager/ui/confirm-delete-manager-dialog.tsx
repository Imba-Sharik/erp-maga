import { deleteManagerMock } from '@/entities/manager'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export interface ConfirmDeleteManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  managerId: string
  managerName: string
  onConfirmed: (id: string) => void
}

export function ConfirmDeleteManagerDialog({
  open,
  onOpenChange,
  managerId,
  managerName,
  onConfirmed,
}: ConfirmDeleteManagerDialogProps) {
  const handleConfirm = () => {
    deleteManagerMock(managerId)
    onConfirmed(managerId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Удалить менеджера?</DialogTitle>
          <DialogDescription>
            Удалить менеджера {managerName}? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
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
            onClick={handleConfirm}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
