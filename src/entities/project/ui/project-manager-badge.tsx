import type { VariantProps } from 'class-variance-authority'

import { useUserRole } from '@/entities/user-role'
import { cn } from '@/shared/lib/utils'
import { Badge, type badgeVariants } from '@/shared/ui/badge'

import type { Project } from '../model/types'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

/**
 * Тон бейджика ведущего менеджера. Сигнал «своё/чужое» виден только менеджеру:
 * зелёный — проект ведёт он сам, жёлтый — другой менеджер. Для остальных ролей
 * (и для непривязанного проекта) бейджик нейтрально-серый.
 */
function managerBadgeVariant(project: Project, isManager: boolean): BadgeVariant {
  if (!isManager || !project.manager) return 'managerNeutral'
  // can_edit == (mag_manager_id == user.id): текущий пользователь — ведущий менеджер.
  return project.canEdit ? 'managerSelf' : 'warning'
}

interface ProjectManagerBadgeProps {
  project: Project
  className?: string
}

export function ProjectManagerBadge({ project, className }: ProjectManagerBadgeProps) {
  const isManager = useUserRole() === 'manager'
  const label = `Менеджер MAG: ${project.manager || '—'}`

  return (
    <Badge
      variant={managerBadgeVariant(project, isManager)}
      title={label}
      className={cn('max-w-full px-2.5 py-0.5 text-xs', className)}
    >
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  )
}
