import { deleteManagerMock } from '@/entities/manager'
import { CircleCrossIcon } from '@/shared/assets'
import { TableIconActionButton } from '@/shared/ui/grid-table'

interface DeleteManagerButtonProps {
  managerId: string
  onDelete: (id: string) => void
}

export function DeleteManagerButton({ managerId, onDelete }: DeleteManagerButtonProps) {
  const handleClick = () => {
    deleteManagerMock(managerId)
    onDelete(managerId)
  }

  return (
    <TableIconActionButton
      icon={<CircleCrossIcon className="size-4 shrink-0 [&_path]:fill-current" />}
      aria-label="Удалить менеджера"
      onClick={handleClick}
    />
  )
}
