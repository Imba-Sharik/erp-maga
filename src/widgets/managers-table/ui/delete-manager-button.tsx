import { CircleCrossIcon } from '@/shared/assets'
import { TableIconActionButton } from '@/shared/ui/grid-table'

interface DeleteManagerButtonProps {
  onRequestDelete: () => void
}

export function DeleteManagerButton({ onRequestDelete }: DeleteManagerButtonProps) {
  return (
    <TableIconActionButton
      icon={<CircleCrossIcon className="size-4 shrink-0 [&_path]:fill-current" />}
      aria-label="Удалить менеджера"
      onClick={onRequestDelete}
    />
  )
}
