import type { ProjectDetail, ProjectStage, StageFormData } from '@/entities/project'
import type {
  ArticleBlock,
  ArticleKind,
  ArticleValues,
  ProjectArticles,
} from '@/entities/project-articles'
import type { StageRecord } from '@/features/advance-stage'

import { StagePassedBonus } from './stage-passed-bonus'
import { StagePassedExpenses } from './stage-passed-expenses'
import { StagePassedReady } from './stage-passed-ready'
import { StageSectionCurrent } from './stage-section-current'
import { StageSectionPassed } from './stage-section-passed'

interface ProjectStageSectionProps {
  project: ProjectDetail
  stage: ProjectStage
  isCurrent: boolean
  record: StageRecord | undefined
  onAdvance: (values?: Partial<StageFormData>) => void
  onPatchValues: (patch: Partial<StageFormData>) => void
  articles: ProjectArticles
  taxRate: number
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number) => void
  onToggleBackline: () => void
  /** Получить запись произвольного этапа (например, `data_confirmed` для отображения «Кто подтвердил» на этапе бонуса). */
  getRecord: (stage: ProjectStage) => StageRecord | undefined
}

export function ProjectStageSection({
  project,
  stage,
  isCurrent,
  record,
  onAdvance,
  onPatchValues,
  articles,
  taxRate,
  onArticleChange,
  onTaxRateChange,
  onToggleBackline,
  getRecord,
}: ProjectStageSectionProps) {
  const financeProps = {
    articles,
    taxRate,
    onArticleChange,
    onTaxRateChange,
    onToggleBackline,
    onAdvance: () => onAdvance(),
  }

  // Этапы с финансовыми блоками — собственная вёрстка
  if (stage === 'ready') {
    return <StagePassedReady isCurrent={isCurrent} record={record} {...financeProps} />
  }
  if (stage === 'expenses_entered') {
    return <StagePassedExpenses isCurrent={isCurrent} record={record} {...financeProps} />
  }
  if (stage === 'bonus_calculated') {
    return (
      <StagePassedBonus
        isCurrent={isCurrent}
        articles={articles}
        dataConfirmedRecord={getRecord('data_confirmed')}
        onArticleChange={onArticleChange}
        onAdvance={onAdvance}
      />
    )
  }

  // Текущий этап с RHF-формой (все, кроме финансовых блоков)
  if (isCurrent) {
    return (
      <StageSectionCurrent
        project={project}
        stage={stage}
        record={record}
        articles={articles}
        onAdvance={onAdvance}
        onPatchValues={onPatchValues}
      />
    )
  }

  // Все остальные (пройденные и закрывающие без отдельного дизайна)
  return (
    <StageSectionPassed
      project={project}
      stage={stage}
      isCurrent={isCurrent}
      record={record}
      articles={articles}
      onAdvance={onAdvance}
    />
  )
}
