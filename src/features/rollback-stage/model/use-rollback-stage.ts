import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { Project } from '@/entities/project'
import { getTransitionErrorMessage, invalidateProjectAfterTransition } from '@/shared/api'
import { useProjectsRollbackStageCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsRollbackStageCreate'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { toast } from '@/shared/ui/toast'

import { buildRollbackStageBody } from '../lib/build-rollback-stage-body'

export interface RollbackStageInput {
  project: Project
  /** Новая фактическая дата мероприятия (ERP-209) — для отката с `event_held`. */
  eventDate?: string
}

interface UseRollbackStageOptions {
  onSuccess?: () => void
}

/**
 * Откат проекта на предыдущий этап (ERP-208/209): `POST /projects/{id}/rollback-stage/`.
 * Предыдущий этап определяет бэк; ответ — `ProjectDetail`, которым обновляем кэш.
 */
export function useRollbackStage({ onSuccess }: UseRollbackStageOptions = {}) {
  const queryClient = useQueryClient()
  const mutation = useProjectsRollbackStageCreate()

  const submit = useCallback(
    (input: RollbackStageInput) => {
      const projectId = Number(input.project.id)
      if (!Number.isFinite(projectId)) return

      mutation.mutate(
        { id: projectId, data: buildRollbackStageBody({ eventDate: input.eventDate }) },
        {
          onSuccess: (detail) => {
            queryClient.setQueryData(projectsRetrieveQueryKey(projectId), detail)
            invalidateProjectAfterTransition(queryClient, projectId)
            toast.success('Проект возвращён на предыдущий этап')
            onSuccess?.()
          },
        },
      )
    },
    [mutation, queryClient, onSuccess],
  )

  const errorMessage = mutation.isError
    ? getTransitionErrorMessage(mutation.error, 'Не удалось вернуть проект на предыдущий этап')
    : null

  return {
    submit,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
    reset: mutation.reset,
  }
}
