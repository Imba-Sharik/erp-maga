import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export interface ConfirmDeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
}

export function ConfirmDeleteProjectDialog({
  open,
  onOpenChange,
  projectName,
}: ConfirmDeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Удалить проект?</DialogTitle>
          <DialogDescription>
            Для удаления проекта бэкенд должен добавить endpoint `DELETE /api/v1/projects/{'{id}'}
            /`. Сейчас действие недоступно.
          </DialogDescription>
          <p className="text-sm text-[#454545]">Проект: {projectName}</p>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
          <Button type="button" variant="destructive" className="rounded-[10px]" disabled>
            Удалить (скоро)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
