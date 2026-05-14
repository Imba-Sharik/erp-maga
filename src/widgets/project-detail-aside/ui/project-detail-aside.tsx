import type { ProjectDetail } from '@/entities/project'

import { ClientDataCard } from './client-data-card'
import { FinanceSummaryCard } from './finance-summary-card'
import { PlumCommentCard } from './plum-comment-card'
import { PlumDataCard } from './plum-data-card'

export function ProjectDetailAside({ project }: { project: ProjectDetail }) {
  return (
    <aside className="flex w-full flex-col gap-4">
      <PlumDataCard project={project} />
      <ClientDataCard project={project} />
      <PlumCommentCard project={project} />
      <FinanceSummaryCard project={project} />
    </aside>
  )
}
