import type { ProjectDetail as ProjectDetailEntity } from '@/entities/project'
import { ProjectDetailAside } from '@/widgets/project-detail-aside'

import { ProjectDetailMainCard } from './project-detail-main-card'
import { ProjectDetailStages } from './project-detail-stages'
import { ProjectDetailTabsRow } from './project-detail-tabs-row'

export function ProjectDetail({ project }: { project: ProjectDetailEntity }) {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-1 items-start gap-5 @[1200px]:grid-cols-[minmax(0,1fr)_405px]">
        <div className="flex w-full min-w-0 flex-col gap-4">
          <ProjectDetailMainCard project={project} />
          <ProjectDetailTabsRow showRequiredHint />
          <ProjectDetailStages project={project} />
        </div>
        <ProjectDetailAside project={project} />
      </div>
    </div>
  )
}
