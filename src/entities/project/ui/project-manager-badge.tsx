import { useUserRole } from '@/entities/user-role'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

import { resolveManagerBadges } from '../lib/manager-badges'
import type { Project } from '../model/types'

interface ProjectManagerBadgeProps {
  project: Project
  className?: string
}

/**
 * Бейджи менеджеров проекта (ERP-189): «Ведущий мен.» и (при наличии)
 * «Вспомогат. мен.». Цвет ведущего сигналит «своё/чужое» только менеджеру; вся
 * логика тонов — в `resolveManagerBadges`.
 */
export function ProjectManagerBadge({ project, className }: ProjectManagerBadgeProps) {
  const isManager = useUserRole() === 'manager'
  const rows = resolveManagerBadges({
    isManager,
    isLeadManager: Boolean(project.isLeadManager),
    leadName: project.manager,
    assistantNames: (project.assistantManagers ?? []).map((a) => a.fullName),
  })

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-0.5', className)}>
      {rows.map((row) => (
        <Badge
          key={row.kind}
          variant={row.variant}
          title={row.text}
          className="max-w-full px-2.5 py-0.5 text-xs"
        >
          <span className="min-w-0 truncate">{row.text}</span>
        </Badge>
      ))}
    </div>
  )
}
