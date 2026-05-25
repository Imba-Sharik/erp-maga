import type { ProjectDetail } from '@/entities/project'
import { useStageFlow } from '@/features/advance-stage'
import { STAGE_PRESENTATION } from '@/widgets/project-detail/lib/stage-presentation'
import { ProjectStageSection } from '@/widgets/project-stage-section'

import { RequestGeneralCard } from './request-general-card'

/**
 * Деталь проекта для бухгалтера: общая информация + единственный блок
 * «Подтверждение документов» (этап `documents_confirmed`).
 * Редактируемый, пока проект на этом этапе; после подтверждения — read-only.
 */
export function RequestDetail({ project }: { project: ProjectDetail }) {
  const flow = useStageFlow({
    projectId: Number(project.id),
    initialStage: project.stage,
    projectEnteredAt: project.enteredSystemAt,
    initialRecords: project.stageSnapshots,
  })

  // useStageFlow гидрирован снимками с бэка — record этапа есть и для закрытого запроса.
  const isDocsCurrent = flow.isCurrent('documents_confirmed')

  return (
    <div className="@container flex w-full min-w-0 flex-col gap-4">
      <RequestGeneralCard project={project} />
      <ProjectStageSection
        presentation={STAGE_PRESENTATION.pipeline}
        project={project}
        stage="documents_confirmed"
        isCurrent={isDocsCurrent}
        record={flow.getRecord('documents_confirmed')}
        onAdvance={flow.advance}
        onPatchValues={flow.patchCurrentStageValues}
        articles={flow.articles}
        taxRate={flow.taxRate}
        onArticleChange={flow.updateArticle}
        onTaxRateChange={flow.setTaxRate}
        onToggleBackline={flow.toggleBackline}
        getRecord={flow.getRecord}
      />
    </div>
  )
}
