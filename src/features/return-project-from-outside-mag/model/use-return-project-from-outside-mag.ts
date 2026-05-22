import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { PreprojectStage, Project } from '@/entities/project'
import { preprojectStageToApi, projectToApiListRow } from '@/entities/project'
import {
  removeProjectFromOutsideMagCaches,
  useProjectTransition,
} from '@/features/project-transition'
import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'
import {
  moveProjectInKanbanCache,
  type KanbanCacheSnapshot,
  restoreKanbanCaches,
  snapshotKanbanCaches,
} from '@/widgets/projects-board/lib/kanban-projects-cache'

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

      const kanbanSnapshot: KanbanCacheSnapshot = snapshotKanbanCaches(queryClient)
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
          onSuccess: () => onSuccess?.(),
          onError: () => {
            restoreKanbanCaches(queryClient, kanbanSnapshot)
            transition.reset()
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
