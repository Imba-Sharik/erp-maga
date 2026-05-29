import { USER_ROLE_LABELS } from '@/entities/user-role'

import { formatActivityTime } from '../lib/format-activity-time'
import type { ProjectActivityEvent } from '../model/types'

const DEFAULT_DOT_COLOR = '#4B61B9'

interface ActivityEventItemProps {
  event: ProjectActivityEvent
}

export function ActivityEventItem({ event }: ActivityEventItemProps) {
  const { actorRole, actorName, action, at, dotColor } = event
  const rolePrefix = actorRole ? `${USER_ROLE_LABELS[actorRole]} ` : ''
  const headline = actorName
    ? `${rolePrefix}${actorName}: ${action}`
    : actorRole
      ? `${USER_ROLE_LABELS[actorRole]}: ${action}`
      : action

  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span
        className="mt-1.5 size-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor ?? DEFAULT_DOT_COLOR }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-[#1B1A17]">{headline}</span>
        <span className="text-xs text-[#ACACAC]">{formatActivityTime(at)}</span>
      </div>
    </div>
  )
}
