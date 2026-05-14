import { Badge } from '@/shared/ui/badge'
import type { ProjectStatus } from '../model/types'

const STATUS = {
  confirmed: { label: 'Данные подтверждены' },
  signed: { label: 'Договор подписан' },
  expenses: { label: 'Расходы внесены' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { label } = STATUS[status]
  return (
    <Badge variant="funnel" className="gap-1 px-1.5 py-px text-[8px]">
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  )
}
