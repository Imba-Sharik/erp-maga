import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useCurrentUser } from '@/entities/current-user'
import { invalidateManagersDirectory } from '@/entities/manager'
import { projectToApiListRow, type Project, type ProjectAssistantManager } from '@/entities/project'
import { useProjectsPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsPartialUpdate'
import {
  invalidateProjectAfterTransition,
  patchProjectInMatchingCaches,
  restoreQueryCaches,
  snapshotTransitionCaches,
  type QueryCacheSnapshot,
} from '@/shared/api'

import { getChangeManagerErrorMessage } from '../lib/get-change-manager-error-message'
import {
  buildChangeManagersRequest,
  type LeadAssistantsSelection,
} from '../lib/lead-assistants-form'
import { patchProjectManagers } from '../lib/patch-project-managers'

export interface ChangeProjectManagersInput {
  project: Project
  leadId: string | null
  leadName: string
  assistants: ProjectAssistantManager[]
}

interface UseChangeProjectManagersOptions {
  onSuccess?: () => void
}

/**
 * Назначение ведущего + вспомогательных менеджеров (ERP-189).
 *
 * Бэк пока хранит только ведущего, поэтому на сервер уходит ТОЛЬКО `mag_manager_id`,
 * а вспомогательные применяются оптимистично в кэше (см. patchProjectManagers).
 * Списки НЕ инвалидируем: рефетч затёр бы вспомогательных (бэк их не возвращает) —
 * оптимистичное состояние держим до конца сессии. При ошибке кэш откатывается.
 *
 * TODO(ERP-189): когда бэк примет `assistant_manager_ids` — слать
 * `buildChangeManagersRequest(selection)` целиком и вернуть обычную инвалидацию списков.
 */
export function useChangeProjectManagers({ onSuccess }: UseChangeProjectManagersOptions = {}) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const mutation = useProjectsPartialUpdate()

  const submit = useCallback(
    ({ project, leadId, leadName, assistants }: ChangeProjectManagersInput) => {
      const projectId = Number(project.id)
      if (!Number.isFinite(projectId)) return

      const selection: LeadAssistantsSelection = {
        leadId,
        assistantIds: assistants.map((a) => a.id),
      }
      // Невалидный id (в т.ч. синтетический `name:`) — buildChangeManagersRequest бросит.
      let request: ReturnType<typeof buildChangeManagersRequest>
      try {
        request = buildChangeManagersRequest(selection)
      } catch {
        return
      }

      const snapshot: QueryCacheSnapshot = snapshotTransitionCaches(queryClient, {
        projectsList: true,
      })
      const optimistic = patchProjectManagers(project, {
        leadId,
        leadName,
        assistants,
        currentUserId: currentUser.id,
      })
      patchProjectInMatchingCaches(queryClient, projectToApiListRow(optimistic))

      mutation.mutate(
        { id: projectId, data: { mag_manager_id: request.mag_manager_id } },
        {
          onSuccess: () => {
            invalidateProjectAfterTransition(queryClient, projectId)
            invalidateManagersDirectory(queryClient)
            onSuccess?.()
          },
          onError: () => {
            restoreQueryCaches(queryClient, snapshot)
          },
        },
      )
    },
    [currentUser.id, mutation, onSuccess, queryClient],
  )

  const errorMessage = mutation.isError ? getChangeManagerErrorMessage(mutation.error) : null

  return useMemo(
    () => ({
      submit,
      isPending: mutation.isPending,
      isError: mutation.isError,
      errorMessage,
      reset: mutation.reset,
    }),
    [submit, mutation.isPending, mutation.isError, mutation.reset, errorMessage],
  )
}
