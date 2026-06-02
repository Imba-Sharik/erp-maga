import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { useUnlinkTelegram } from '../model/use-unlink-telegram'

export interface ConfirmUnlinkTelegramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string | null
}

export function ConfirmUnlinkTelegramDialog({
  open,
  onOpenChange,
  username,
}: ConfirmUnlinkTelegramDialogProps) {
  const { unlink, isPending } = useUnlinkTelegram({
    onSuccess: () => onOpenChange(false),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-[#1B1A17]">Отвязать Telegram?</DialogTitle>
          <DialogDescription>
            {username
              ? `Аккаунт ${username} перестанет получать уведомления от бота MAG в Telegram.`
              : 'Telegram перестанет получать уведомления от бота MAG.'}
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
            onClick={unlink}
            disabled={isPending}
          >
            {isPending ? 'Отвязка…' : 'Отвязать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
