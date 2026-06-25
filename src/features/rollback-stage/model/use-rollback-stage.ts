import { useCallback, useState } from 'react'

import type { Project } from '@/entities/project'
import { useProjectTransition } from '@/shared/api'
import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'
import { toast } from '@/shared/ui/toast'

import { ROLLBACK_TRANSITION_READY, buildRollbackStageBody } from '../lib/build-rollback-stage-body'
import { getPreviousStage } from '../lib/get-previous-stage'

const STUB_NOTICE =
  'Откат пока заглушён: интерфейс и логика готовы, но тело перехода ждёт контракта бэка ' +
  '(ERP-199). Реальный переход включается флагом ROLLBACK_TRANSITION_READY.'

export interface RollbackStageInput {
  project: Project
  /** Новая фактическая дата мероприятия (ERP-209) — уходит в тело при откате с `event_held`. */
  eventDate?: string
}

interface UseRollbackStageOptions {
  onSuccess?: () => void
}

/**
 * Откат проекта на предыдущий этап (ERP-208/209) по образцу
 * `useReturnProjectFromOutsideMag`. Пока `ROLLBACK_TRANSITION_READY === false`
 * реальный запрос не уходит — `submit` лишь выставляет inline-уведомление.
 */
export function useRollbackStage({ onSuccess }: UseRollbackStageOptions = {}) {
  const transition = useProjectTransition({
    fallbackErrorMessage: 'Не удалось вернуть проект на предыдущий этап',
  })
  const [notice, setNotice] = useState<string | null>(null)

  const submit = useCallback(
    (input: RollbackStageInput) => {
      const { project, eventDate } = input
      if (!getPreviousStage(project.stage)) return

      // Заглушка: контракт тела перехода для отката бэком не подтверждён (ERP-199).
      // UI и логика собраны, но настоящий запрос не уходит, пока флаг выключен.
      if (!ROLLBACK_TRANSITION_READY) {
        setNotice(STUB_NOTICE)
        return
      }

      const projectId = Number(project.id)
      if (!Number.isFinite(projectId)) return

      // `useProjectTransition` сам кладёт detail в кэш и инвалидирует связанные
      // запросы. Оптимистичный перенос карточки в канбане можно добавить здесь,
      // когда бэк подтвердит контракт (по образцу use-return-project-from-outside-mag).
      transition.submit(
        projectId,
        buildRollbackStageBody(project, { eventDate }) as unknown as ProjectTransitionRequest,
        {
          onSuccess: () => {
            toast.success('Проект возвращён на предыдущий этап')
            onSuccess?.()
          },
        },
      )
    },
    [onSuccess, transition],
  )

  const reset = useCallback(() => {
    setNotice(null)
    transition.reset()
  }, [transition])

  return {
    submit,
    isPending: transition.isPending,
    isError: transition.isError,
    errorMessage: transition.errorMessage,
    notice,
    reset,
  }
}
