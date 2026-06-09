import { ConfirmDownloadDialog } from './confirm-download-dialog'

export interface ConfirmDownloadBindingProps {
  fileName: string
  confirmOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function ConfirmDownloadBinding({
  fileName,
  confirmOpen,
  onOpenChange,
  onConfirm,
  isPending,
}: ConfirmDownloadBindingProps) {
  if (!fileName) return null

  return (
    <ConfirmDownloadDialog
      open={confirmOpen}
      onOpenChange={onOpenChange}
      fileName={fileName}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  )
}
