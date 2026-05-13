import { Badge } from '@/shared/ui/badge'
import type { ProjectStatus } from '../model/types'

const STATUS = {
  confirmed: { variant: 'success' as const, label: 'Данные подтверждены' },
  signed: { variant: 'info' as const, label: 'Договор подписан' },
  expenses: { variant: 'warning' as const, label: 'Расходы внесены' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { variant, label } = STATUS[status]
  return (
    <Badge variant={variant} className="gap-1 px-1.5 py-px text-[8px]">
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  )
}
