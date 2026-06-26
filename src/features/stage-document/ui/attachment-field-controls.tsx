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
      className="border-border-strong h-9 w-full justify-center rounded-[10px] text-sm font-normal"
      disabled={disabled}
      onClick={onClick}
    >
      {isPending ? 'Загрузка…' : label}
    </Button>
  )
}

export function AttachmentEmptyPlaceholder() {
  return (
    <div className="border-border-strong bg-surface-subtle flex h-9 w-full items-center rounded-[10px] border px-3 py-2 text-sm">
      <span className="text-muted-foreground">—</span>
    </div>
  )
}

export function AttachmentRejectedPlaceholder() {
  return (
    <div className="bg-error-surface flex h-9 w-full items-center rounded-[10px] px-3 py-2 text-sm">
      <span className="text-error">—</span>
    </div>
  )
}
