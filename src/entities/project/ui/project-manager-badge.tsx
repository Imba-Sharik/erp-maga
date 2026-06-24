import { useCurrentUser } from '@/entities/current-user'
import { useUserRole } from '@/entities/user-role'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

import { resolveManagerBadges } from '../lib/manager-badges'
import { isProjectLeadManager } from '../lib/resolve-manager-role'
import type { Project } from '../model/types'

interface ProjectManagerBadgeProps {
  project: Project
  className?: string
}

/**
 * Бейджи менеджеров проекта (ERP-189): «Ведущий» и (при наличии)
 * «Вспом.» по строке на каждого. Цвет ведущего сигналит «своё/чужое» только менеджеру; вся
 * логика тонов — в `resolveManagerBadges`.
 */
export function ProjectManagerBadge({ project, className }: ProjectManagerBadgeProps) {
  const isManager = useUserRole() === 'manager'
  const currentUser = useCurrentUser()
  const rows = resolveManagerBadges({
    isManager,
    isLeadManager: isProjectLeadManager(project, currentUser.id),
    leadName: project.manager,
    assistantNames: (project.assistantManagers ?? []).map((a) => a.fullName),
  })

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-1.5', className)}>
      {rows.map((row, i) => (
        <Badge
          key={`${row.kind}-${i}`}
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
