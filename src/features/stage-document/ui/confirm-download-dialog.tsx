import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export interface ConfirmDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  onConfirm: () => void
  isPending?: boolean
}

export function ConfirmDownloadDialog({
  open,
  onOpenChange,
  fileName,
  onConfirm,
  isPending = false,
}: ConfirmDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Скачать файл?</DialogTitle>
          <DialogDescription className="break-all">{fileName}</DialogDescription>
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
            className="rounded-[10px]"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Скачивание…' : 'Скачать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
