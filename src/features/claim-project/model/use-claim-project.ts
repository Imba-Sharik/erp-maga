import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useCurrentUser } from '@/entities/current-user'
import { invalidateManagersDirectory } from '@/entities/manager'
import type { Project } from '@/entities/project'
import { projectToApiListRow } from '@/entities/project'
import { useProjectsPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsPartialUpdate'
import {
  invalidateProjectAfterTransition,
  patchProjectInMatchingCaches,
  restoreQueryCaches,
  snapshotTransitionCaches,
  type QueryCacheSnapshot,
} from '@/shared/api'
import { toast } from '@/shared/ui/toast'

import { buildClaimRequest } from '../lib/build-claim-request'
import { getClaimErrorMessage } from '../lib/get-claim-error-message'
import { patchClaimedProject } from '../lib/patch-claimed-project'

export interface ClaimProjectInput {
  project: Project
}

/**
 * «Взять проект» из пула: менеджер назначает себя ведущим (PATCH `mag_manager_id`).
 * Карточка обновляется оптимистично «на месте» (проект остаётся в своей колонке),
 * при ошибке кэш откатывается. Результат — тост.
 */
export function useClaimProject() {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const mutation = useProjectsPartialUpdate()

  const submit = useCallback(
    ({ project }: ClaimProjectInput) => {
      const projectId = Number(project.id)
      if (!Number.isFinite(projectId)) return

      let data: ReturnType<typeof buildClaimRequest>
      try {
        data = buildClaimRequest(currentUser.id)
      } catch {
        toast.error('Не удалось определить текущего пользователя')
        return
      }

      const snapshot: QueryCacheSnapshot = snapshotTransitionCaches(queryClient, {
        projectsList: true,
      })
      const optimistic = patchClaimedProject(project, { fullName: currentUser.fullName })
      patchProjectInMatchingCaches(queryClient, projectToApiListRow(optimistic))

      mutation.mutate(
        { id: projectId, data },
        {
          onSuccess: () => {
            invalidateProjectAfterTransition(queryClient, projectId)
            invalidateManagersDirectory(queryClient)
            toast.success('Проект взят в работу')
          },
          onError: (error) => {
            restoreQueryCaches(queryClient, snapshot)
            toast.error(getClaimErrorMessage(error))
          },
        },
      )
    },
    [currentUser.fullName, currentUser.id, mutation, queryClient],
  )

  return {
    submit,
    isPending: mutation.isPending,
  }
}
