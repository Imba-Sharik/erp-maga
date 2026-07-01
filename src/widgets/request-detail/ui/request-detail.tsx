import type { ProjectDetail } from '@/entities/project'
import { useStageFlow } from '@/features/advance-stage'
import { STAGE_PRESENTATION } from '@/shared/lib/stage-presentation'
import { ProjectStageSection } from '@/widgets/project-stage-section'

import { RequestGeneralCard } from './request-general-card'

/**
 * Деталь проекта для бухгалтера: общая информация, блок «Подтверждение
 * документов» (этап `documents_confirmed`, редактируемый пока проект на нём)
 * и read-only блок «Расчёт подготовлен» — чтобы бухгалтер мог скачать и
 * посмотреть смету (редактировать этап он не может).
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

  // Общие пропсы flow для секции этапа — calc-этап бухгалтер не редактирует,
  // поэтому без onEditPassed (кнопка «Редактировать» не появляется).
  const stageFlowProps = {
    presentation: STAGE_PRESENTATION.pipeline,
    project,
    onAdvance: flow.advance,
    onPatchValues: flow.patchCurrentStageValues,
    articles: flow.articles,
    taxRate: flow.taxRate,
    onArticleChange: flow.updateArticle,
    onTaxRateChange: flow.setTaxRate,
    onToggleBackline: flow.toggleBackline,
    onReplaceArticles: flow.replaceArticles,
    getRecord: flow.getRecord,
  }

  return (
    <div className="@container flex w-full min-w-0 flex-col gap-4">
      <RequestGeneralCard project={project} />
      <ProjectStageSection
        {...stageFlowProps}
        stage="documents_confirmed"
        isCurrent={isDocsCurrent}
        record={flow.getRecord('documents_confirmed')}
      />
      <ProjectStageSection
        {...stageFlowProps}
        stage="calculation_prepared"
        isCurrent={flow.isCurrent('calculation_prepared')}
        record={flow.getRecord('calculation_prepared')}
      />
    </div>
  )
}
