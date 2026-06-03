import { PenIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/button'

interface ChangeManagerButtonProps {
  onRequestChange: () => void
}

export function ChangeManagerButton({ onRequestChange }: ChangeManagerButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="shrink-0 text-[#BCBCBC] hover:text-[#454545]"
      aria-label="Сменить менеджера"
      title="Сменить менеджера"
      onClick={onRequestChange}
    >
      <PenIcon className="size-3 shrink-0 [&_path]:fill-current" />
    </Button>
  )
}
