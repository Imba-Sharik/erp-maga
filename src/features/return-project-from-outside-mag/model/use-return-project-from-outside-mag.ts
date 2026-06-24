import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { PreprojectStage, Project } from '@/entities/project'
import { preprojectStageToApi, projectToApiListRow } from '@/entities/project'
import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'
import {
  moveProjectInKanbanCache,
  removeProjectFromOutsideMagCaches,
  restoreQueryCaches,
  snapshotTransitionCaches,
  useProjectTransition,
  type QueryCacheSnapshot,
} from '@/shared/api'
import { toast } from '@/shared/ui/toast'

import { buildReturnFromOutsideMagBody } from '../lib/build-return-from-outside-mag-body'

export interface ReturnProjectFromOutsideMagInput {
  project: Project
  targetStage: PreprojectStage
}

interface UseReturnProjectFromOutsideMagOptions {
  onSuccess?: () => void
}

export function useReturnProjectFromOutsideMag({
  onSuccess,
}: UseReturnProjectFromOutsideMagOptions = {}) {
  const queryClient = useQueryClient()
  const transition = useProjectTransition({
    fallbackErrorMessage: 'Не удалось вернуть проект в воронку',
  })

  const submit = useCallback(
    (input: ReturnProjectFromOutsideMagInput) => {
      const projectId = Number(input.project.id)
      if (!Number.isFinite(projectId)) return

      const targetApiStage = preprojectStageToApi(input.targetStage)
      const apiRow = {
        ...projectToApiListRow(input.project),
        stage: targetApiStage,
      }

      const cacheSnapshot: QueryCacheSnapshot = snapshotTransitionCaches(queryClient, {
        projectsList: true,
        outsideMag: true,
      })
      removeProjectFromOutsideMagCaches(queryClient, projectId)
      moveProjectInKanbanCache(queryClient, {
        project: apiRow,
        fromApiStage: 'out_of_mag_scope',
        toApiStage: targetApiStage,
      })

      // payload не в сгенерированном OpenAPI; бэк читает target_stage из payload.
      transition.submit(
        projectId,
        buildReturnFromOutsideMagBody(input.targetStage) as unknown as ProjectTransitionRequest,
        {
          onSuccess: () => {
            toast.success('Проект возвращён в воронку')
            onSuccess?.()
          },
          onError: () => {
            restoreQueryCaches(queryClient, cacheSnapshot)
            transition.reset()
            toast.error('Не удалось вернуть проект в воронку')
          },
        },
      )
    },
    [onSuccess, queryClient, transition],
  )

  return {
    submit,
    isPending: transition.isPending,
    isError: transition.isError,
    errorMessage: transition.errorMessage,
    reset: transition.reset,
  }
}
