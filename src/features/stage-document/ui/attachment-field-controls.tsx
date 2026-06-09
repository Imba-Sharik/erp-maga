import { Button } from '@/shared/ui/button'

export interface AttachmentUploadButtonProps {
  disabled: boolean
  isPending: boolean
  label: string
  onClick: () => void
}

export function AttachmentUploadButton({
  disabled,
  isPending,
  label,
  onClick,
}: AttachmentUploadButtonProps) {
  return (
    <Button
      type="button"
      className="h-9 w-full justify-center rounded-[10px] border-[#B1B1B1] text-sm font-normal"
      disabled={disabled}
      onClick={onClick}
    >
      {isPending ? 'Загрузка…' : label}
    </Button>
  )
}

export function AttachmentEmptyPlaceholder() {
  return (
    <div className="flex h-9 w-full items-center rounded-[10px] border border-[#B1B1B1] bg-[#FAFAFA] px-3 py-2 text-sm">
      <span className="text-muted-foreground">—</span>
    </div>
  )
}

export function AttachmentRejectedPlaceholder() {
  return (
    <div className="flex h-9 w-full items-center rounded-[10px] bg-[#FDEDED] px-3 py-2 text-sm">
      <span className="text-[#D25252]">—</span>
    </div>
  )
}
