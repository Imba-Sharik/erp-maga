import { useEffect, useState } from 'react'

import { useCurrentUser } from '@/entities/current-user'
import {
  isOutsideMagStage,
  resolveProjectReadOnly,
  STAGE_FUNNEL,
  type ProjectDetail as ProjectDetailEntity,
} from '@/entities/project'
import { stageDraftActions } from '@/entities/stage-draft'
import { useStageFlow } from '@/features/advance-stage'
import { MoveProjectOutsideMagDialog } from '@/features/move-project-outside-mag'
import { useProjectTab } from '@/features/project-tabs'
import { ProjectActivityLog } from '@/widgets/project-activity-log'
import { ProjectDetailAside } from '@/widgets/project-detail-aside'
import { ProjectDocuments } from '@/widgets/project-documents'
import { ProjectReminders } from '@/widgets/project-reminders'

import { ProjectDetailMainCard } from './project-detail-main-card'
import { ProjectDetailStages } from './project-detail-stages'
import { ProjectDetailTabsRow } from './project-detail-tabs-row'
import { ProjectReadOnlyBanner } from './project-read-only-banner'

export function ProjectDetail({ project }: { project: ProjectDetailEntity }) {
  const currentUser = useCurrentUser()
  const [outsideMagOpen, setOutsideMagOpen] = useState(false)
  const readOnly = resolveProjectReadOnly(project)
  // Баннер «ведёт другой менеджер» уместен только для занятого проекта. Свободный
  // (из пула, без назначения) тоже read-only, но его никто не ведёт — баннер не нужен.
  const showReadOnlyBanner = readOnly && Boolean(project.manager)
  const showOutsideMagButton =
    STAGE_FUNNEL[project.stage] === 'pre_project' && !isOutsideMagStage(project.stage) && !readOnly

  const flow = useStageFlow({
    projectId: Number(project.id),
    initialStage: project.stage,
    projectEnteredAt: project.enteredSystemAt,
    initialRecords: project.stageSnapshots,
    initialArticles: project.articles,
    initialTaxRate: project.taxRate,
  })

  const [tab] = useProjectTab()

  useEffect(() => {
    return () => {
      stageDraftActions.markHighlightPending(project.id, currentUser.id)
    }
  }, [project.id, currentUser.id])

  return (
    <div className="@container w-full">
      <div className="grid grid-cols-1 items-start gap-5 @[1200px]:grid-cols-[minmax(0,1fr)_405px]">
        <div className="flex w-full min-w-0 flex-col gap-4">
          <ProjectDetailMainCard project={project} currentStage={flow.currentStage} />
          {showReadOnlyBanner ? <ProjectReadOnlyBanner /> : null}
          <ProjectDetailTabsRow
            showOutsideMagButton={showOutsideMagButton}
            onOutsideMagClick={() => setOutsideMagOpen(true)}
          />
          {tab === 'actions' ? (
            <ProjectActivityLog projectId={Number(project.id)} />
          ) : tab === 'documents' ? (
            <ProjectDocuments project={project} getRecord={flow.getRecord} />
          ) : tab === 'reminders' && currentUser.role !== 'director' ? (
            <ProjectReminders
              projectId={Number(project.id)}
              editable={
                !readOnly && (currentUser.role === 'manager' || currentUser.role === 'admin')
              }
            />
          ) : (
            <ProjectDetailStages project={project} flow={flow} readOnly={readOnly} />
          )}
        </div>
        <ProjectDetailAside project={project} />
      </div>

      <MoveProjectOutsideMagDialog
        open={outsideMagOpen}
        onOpenChange={setOutsideMagOpen}
        project={project}
        redirectOnSuccess="/outside-mag"
      />
    </div>
  )
}
