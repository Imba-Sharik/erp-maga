import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { OutsideMagReason, Project } from '@/entities/project'
import { projectStageToApi, projectToApiListRow } from '@/entities/project'
import { useProjectTransition } from '@/features/project-transition'
import {
  removeProjectFromMatchingCaches,
  restoreKanbanCaches,
  snapshotKanbanCaches,
  type KanbanCacheSnapshot,
} from '@/widgets/projects-board/lib/kanban-projects-cache'

import { buildOutsideMagTransitionBody } from '../lib/build-outside-mag-transition-body'

export interface MoveProjectOutsideMagInput {
  project: Project
  reason: OutsideMagReason
}

interface UseMoveProjectOutsideMagOptions {
  onSuccess?: () => void
}

export function useMoveProjectOutsideMag({ onSuccess }: UseMoveProjectOutsideMagOptions = {}) {
  const queryClient = useQueryClient()
  const transition = useProjectTransition({
    fallbackErrorMessage: 'Не удалось перевести проект во «Вне контура MAG»',
  })

  const submit = useCallback(
    (input: MoveProjectOutsideMagInput) => {
      const projectId = Number(input.project.id)
      if (!Number.isFinite(projectId)) return

      const apiRow = projectToApiListRow(input.project)
      const fromApiStage = projectStageToApi(input.project.stage)
      const kanbanSnapshot: KanbanCacheSnapshot = snapshotKanbanCaches(queryClient)

      removeProjectFromMatchingCaches(queryClient, apiRow, {
        boardApiStage: fromApiStage,
      })

      transition.submit(projectId, buildOutsideMagTransitionBody(input.reason), {
        onSuccess: () => onSuccess?.(),
        onError: () => {
          restoreKanbanCaches(queryClient, kanbanSnapshot)
          transition.reset()
        },
      })
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
