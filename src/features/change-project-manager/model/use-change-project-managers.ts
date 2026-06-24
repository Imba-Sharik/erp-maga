import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { useCurrentUser } from '@/entities/current-user'
import { invalidateManagersDirectory } from '@/entities/manager'
import { projectToApiListRow, type Project, type ProjectAssistantManager } from '@/entities/project'
import { projectsAssistantManagerAdd } from '@/shared/api/generated/clients/projectsController/projectsAssistantManagerAdd'
import { projectsAssistantManagerBulkRemove } from '@/shared/api/generated/clients/projectsController/projectsAssistantManagerBulkRemove'
import { projectsPartialUpdate } from '@/shared/api/generated/clients/projectsController/projectsPartialUpdate'
import { invalidateProjectAfterTransition, patchProjectInMatchingCaches } from '@/shared/api'

import { diffAssistantManagers } from '../lib/diff-assistant-managers'
import { getChangeManagerErrorMessage } from '../lib/get-change-manager-error-message'
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

interface ChangeManagersVariables {
  projectId: number
  magManagerId: number | null
  leadChanged: boolean
  toAdd: number[]
  toRemove: number[]
}

/**
 * Назначение ведущего + вспомогательных менеджеров (ERP-189).
 *
 * Бэк хранит вспомогательных через bulk-ручки, поэтому submit раскладывается максимум в 3
 * запроса: PATCH ведущего (если сменился) → bulk-remove снятых → bulk-add добавленных.
 * Порядок важен: бэк отклоняет добавление текущего `mag_manager` в ассистенты, поэтому ведущий
 * финализируется раньше add (новый ведущий уже убран формой из набора ассистентов).
 * После завершения серии — обычная инвалидация (бэк теперь отдаёт `assistant_managers`,
 * рефетч = истина). Оптимистичный патч — лишь для мгновенного отклика; ошибку примиряет рефетч.
 */
export function useChangeProjectManagers({ onSuccess }: UseChangeProjectManagersOptions = {}) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()

  const mutation = useMutation({
    mutationFn: async ({
      projectId,
      magManagerId,
      leadChanged,
      toAdd,
      toRemove,
    }: ChangeManagersVariables) => {
      if (leadChanged) {
        await projectsPartialUpdate(projectId, { mag_manager_id: magManagerId })
      }
      if (toRemove.length > 0) {
        await projectsAssistantManagerBulkRemove(projectId, { manager_ids: toRemove })
      }
      if (toAdd.length > 0) {
        await projectsAssistantManagerAdd(projectId, { manager_ids: toAdd })
      }
    },
    onSettled: (_data, _error, variables) => {
      invalidateProjectAfterTransition(queryClient, variables.projectId)
      invalidateManagersDirectory(queryClient)
    },
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const submit = useCallback(
    ({ project, leadId, leadName, assistants }: ChangeProjectManagersInput) => {
      const projectId = Number(project.id)
      if (!Number.isFinite(projectId)) return

      const magManagerId = leadId ? Number(leadId) : null
      // Синтетический id ведущего (`name:`) нельзя отправить на бэк.
      if (leadId !== null && magManagerId !== null && !Number.isFinite(magManagerId)) return

      const leadChanged = (project.leadManagerId ?? null) !== (leadId ?? null)
      const { toAdd, toRemove } = diffAssistantManagers(
        (project.assistantManagers ?? []).map((a) => a.id),
        assistants.map((a) => a.id),
      )

      if (!leadChanged && toAdd.length === 0 && toRemove.length === 0) {
        onSuccess?.()
        return
      }

      const optimistic = patchProjectManagers(project, {
        leadId,
        leadName,
        assistants,
        currentUserId: currentUser.id,
      })
      patchProjectInMatchingCaches(queryClient, projectToApiListRow(optimistic))

      mutation.mutate({ projectId, magManagerId, leadChanged, toAdd, toRemove })
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
