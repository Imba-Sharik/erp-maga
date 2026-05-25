import { useMemo } from 'react'

import type { ProjectDetail } from '@/entities/project'
import {
  ActivityEventItem,
  buildActivityFeed,
  type ActivityStageRecords,
} from '@/entities/project-activity'

interface ProjectActivityLogProps {
  project: ProjectDetail
  records: ActivityStageRecords
}

export function ProjectActivityLog({ project, records }: ProjectActivityLogProps) {
  const events = useMemo(
    () => buildActivityFeed({ records, projectManager: project.manager }),
    [project.manager, records],
  )

  if (events.length === 0) {
    return (
      <p className="text-sm text-[#ACACAC]">
        Пока нет действий по проекту. Записи появятся по мере прохождения этапов.
      </p>
    )
  }

  return (
    <div className="divide-y divide-[#F0F0F0] overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white">
      {events.map((e) => (
        <ActivityEventItem key={e.id} event={e} />
      ))}
    </div>
  )
}
