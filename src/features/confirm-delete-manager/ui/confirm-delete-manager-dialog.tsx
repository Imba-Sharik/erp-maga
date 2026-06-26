import { Button } from '@/shared/ui/button'

import { useDeactivateManager } from '../model/use-deactivate-manager'
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
  const { deactivate, isPending } = useDeactivateManager({
    onSuccess: () => {
      onConfirmed(managerId)
      onOpenChange(false)
    },
  })

  const handleConfirm = () => {
    deactivate(managerId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            Заблокировать менеджера?
          </DialogTitle>
          <DialogDescription>
            Заблокировать менеджера {managerName}? Он исчезнет из списка активных менеджеров MAG.
          </DialogDescription>
        </DialogHeader>
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
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Блокировка…' : 'Заблокировать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
