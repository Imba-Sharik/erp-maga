import type { ProjectStage, StageFormData } from '@/entities/project'
import type { ProjectArticles } from '@/entities/project-articles'

/**
 * Черновик незаполненного этапа: данные, которые пользователь успел ввести,
 * но не отправил («Следующий этап» не нажат). Сохраняется при уходе со страницы
 * проекта, восстанавливается при возврате. У каждого пользователя — свой черновик.
 */
export interface StageDraft {
  /** Этап, который пользователь начал заполнять. */
  stage: ProjectStage
  /** ID пользователя-автора — обводку в канбане и восстановление видит только он. */
  authorId: string
  /** Значения RHF-формы (обычные этапы). */
  values?: Partial<StageFormData>
  /** Финансовые статьи (ready_to_event / expenses_entered / bonus_calculated). */
  articles?: ProjectArticles
  /** Ставка налога (ready_to_event). */
  taxRate?: number
  /** ISO-datetime сохранения. */
  savedAt: string
  /**
   * Показывать жёлтую обводку — только после ухода со страницы проекта
   * с незавершённым черновиком, не во время активного ввода.
   */
  highlightPending?: boolean
}
