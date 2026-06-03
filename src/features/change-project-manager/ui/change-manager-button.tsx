import { UserRoundPen } from 'lucide-react'

import { TableIconActionButton } from '@/shared/ui/grid-table'

interface ChangeManagerButtonProps {
  onRequestChange: () => void
}

export function ChangeManagerButton({ onRequestChange }: ChangeManagerButtonProps) {
  return (
    <TableIconActionButton
      icon={<UserRoundPen className="size-4 shrink-0" />}
      aria-label="Сменить менеджера"
      title="Сменить менеджера"
      onClick={onRequestChange}
    />
  )
}
