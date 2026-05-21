import { TopLeftArrowIcon } from '@/shared/assets'
import { TableIconActionButton } from '@/shared/ui/grid-table'

interface ReturnFromOutsideMagButtonProps {
  onClick: () => void
}

export function ReturnFromOutsideMagButton({ onClick }: ReturnFromOutsideMagButtonProps) {
  return (
    <TableIconActionButton
      icon={<TopLeftArrowIcon className="size-4 shrink-0 [&_path]:fill-current" />}
      aria-label="Вернуть из вне контура"
      onClick={onClick}
    />
  )
}
