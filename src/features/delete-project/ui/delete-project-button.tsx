import { CircleCrossIcon } from '@/shared/assets'
import { TableIconActionButton } from '@/shared/ui/grid-table'

interface DeleteProjectButtonProps {
  onRequestDelete: () => void
}

export function DeleteProjectButton({ onRequestDelete }: DeleteProjectButtonProps) {
  return (
    <TableIconActionButton
      icon={<CircleCrossIcon className="size-4 shrink-0 [&_path]:fill-current" />}
      aria-label="Удалить проект"
      onClick={onRequestDelete}
    />
  )
}
