import {
  resolveStageBlockEditable,
  resolveStageEditAccess,
  type ProjectDetail,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import type {
  ArticleBlock,
  ArticleKind,
  ArticleValues,
  ProjectArticles,
} from '@/entities/project-article'
import { useStageHasDraftHighlight } from '@/entities/stage-draft'
import { useUserRole } from '@/entities/user-role'
import { isStagePatchable, type StageRecord } from '@/features/advance-stage'
import type { StagePresentationConfig } from '@/shared/lib/stage-presentation'

import { StagePassedBonus } from './stage-passed-bonus'
import { StagePassedExpenses } from './stage-passed-expenses'
import { StagePassedReady } from './stage-passed-ready'
import { StageSectionCurrent } from './stage-section-current'
import { StageSectionDraftFrame } from './stage-section-draft-frame'
import { StageSectionPassed } from './stage-section-passed'
import { StageSectionSkipped } from './stage-section-skipped'

interface ProjectStageSectionProps {
  presentation: StagePresentationConfig
  project: ProjectDetail
  stage: ProjectStage
  isCurrent: boolean
  /** Этап был пропущен (проект перешёл дальше с пустыми полями этого этапа). */
  isSkipped?: boolean
  record: StageRecord | undefined
  onAdvance: (values?: Partial<StageFormData>) => void
  /** Переход уже выполняется — гасим кнопки «Следующий этап». */
  isAdvancing?: boolean
  onPatchValues: (patch: Partial<StageFormData>) => void
  /**
   * Поправить поля произвольного этапа задним числом — используется и для
   * дозаполнения пропущенного, и для редактирования уже заполненного.
   */
  onPatchStageValues?: (stage: ProjectStage, values: Partial<StageFormData>) => void
  articles: ProjectArticles
  taxRate: number | null
  onArticleChange: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  onTaxRateChange: (rate: number | null) => void
  onToggleBackline: () => void
  /** Заменить статьи целиком — для отмены инлайн-правки финансового этапа. */
  onReplaceArticles: (next: ProjectArticles) => void
  /** Получить запись произвольного этапа (например, `data_confirmed` для отображения «Кто подтвердил» на этапе бонуса). */
  getRecord: (stage: ProjectStage) => StageRecord | undefined
}

export function ProjectStageSection({
  presentation,
  project,
  stage,
  isCurrent,
  isSkipped = false,
  record,
  onAdvance,
  isAdvancing,
  onPatchValues,
  onPatchStageValues,
  articles,
  taxRate,
  onArticleChange,
  onTaxRateChange,
  onToggleBackline,
  onReplaceArticles,
  getRecord,
}: ProjectStageSectionProps) {
  const hasDraftHighlight = useStageHasDraftHighlight(project.id, stage)
  const readOnly = presentation.readOnly
  const role = useUserRole()

  // Единый резолвер прав: правку пройденного блока разрешает серверный флаг can_edit_*
  // (развязан с глобальным read-only), а кнопка показывается только если у этапа есть
  // реальный PATCH-маршрут (isStagePatchable).
  const access = resolveStageEditAccess({
    stage,
    role,
    isCurrent,
    readOnly,
    blockEditable: resolveStageBlockEditable(project, stage),
  })
  const editPassedHandler =
    access.canEditPassed && onPatchStageValues && isStagePatchable(stage)
      ? (values: Partial<StageFormData>) => onPatchStageValues(stage, values)
      : undefined

  const financeProps = {
    presentation,
    project,
    articles,
    taxRate,
    onArticleChange,
    onTaxRateChange,
    onToggleBackline,
    onReplaceArticles,
    onAdvance: () => onAdvance(),
    isAdvancing,
    // Финансовый Save шлёт пустые values — статьи реестр читает из общего articles.
    onSavePassed: editPassedHandler ? () => editPassedHandler({}) : undefined,
  }

  // Пропущенный этап — отдельная вёрстка с возможностью дозаполнить.
  if (isSkipped && onPatchStageValues) {
    return (
      <StageSectionDraftFrame hasDraftHighlight={hasDraftHighlight}>
        <StageSectionSkipped
          project={project}
          stage={stage}
          record={record}
          articles={articles}
          hasDraftHighlight={hasDraftHighlight}
          readOnly={readOnly}
          onFillSkipped={(values) => onPatchStageValues(stage, values)}
        />
      </StageSectionDraftFrame>
    )
  }

  // Этапы с финансовыми блоками — собственная вёрстка
  if (stage === 'ready_to_event') {
    return (
      <StageSectionDraftFrame hasDraftHighlight={hasDraftHighlight}>
        <StagePassedReady
          isCurrent={isCurrent}
          record={record}
          hasDraftHighlight={hasDraftHighlight}
          {...financeProps}
        />
      </StageSectionDraftFrame>
    )
  }
  if (stage === 'expenses_entered') {
    return (
      <StageSectionDraftFrame hasDraftHighlight={hasDraftHighlight}>
        <StagePassedExpenses
          isCurrent={isCurrent}
          record={record}
          hasDraftHighlight={hasDraftHighlight}
          {...financeProps}
        />
      </StageSectionDraftFrame>
    )
  }
  if (stage === 'bonus_calculated') {
    return (
      <StageSectionDraftFrame hasDraftHighlight={hasDraftHighlight}>
        <StagePassedBonus
          presentation={presentation}
          project={project}
          isCurrent={isCurrent}
          articles={articles}
          hasDraftHighlight={hasDraftHighlight}
          dataConfirmedRecord={getRecord('data_confirmed')}
          onArticleChange={onArticleChange}
          onAdvance={onAdvance}
          isAdvancing={isAdvancing}
          onReplaceArticles={onReplaceArticles}
          onSavePassed={editPassedHandler ? () => editPassedHandler({}) : undefined}
        />
      </StageSectionDraftFrame>
    )
  }

  // Текущий этап с RHF-формой (все, кроме финансовых блоков)
  if (isCurrent) {
    return (
      <StageSectionDraftFrame hasDraftHighlight={hasDraftHighlight}>
        <StageSectionCurrent
          project={project}
          stage={stage}
          record={record}
          articles={articles}
          hasDraftHighlight={hasDraftHighlight}
          readOnly={readOnly}
          onAdvance={onAdvance}
          isAdvancing={isAdvancing}
          onPatchValues={onPatchValues}
        />
      </StageSectionDraftFrame>
    )
  }

  // Все остальные (пройденные и закрывающие без отдельного дизайна)
  return (
    <StageSectionDraftFrame hasDraftHighlight={hasDraftHighlight}>
      <StageSectionPassed
        project={project}
        stage={stage}
        isCurrent={isCurrent}
        record={record}
        articles={articles}
        hasDraftHighlight={hasDraftHighlight}
        readOnly={readOnly}
        onAdvance={onAdvance}
        onEditPassed={editPassedHandler}
      />
    </StageSectionDraftFrame>
  )
}
