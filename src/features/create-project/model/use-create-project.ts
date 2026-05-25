import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useVenueCatalog } from '@/entities/venue'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { useProjectsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsCreate'
import type { Project } from '@/shared/api/generated/types/Project'
import { getEventTypeLabelById } from '@/shared/constants/event-type-options'
import { toIsoLocalDay } from '@/shared/lib/date/to-iso-local-day'

import { buildOptimisticProject } from '../lib/build-optimistic-project'
import type { CreateProjectFormValues } from '../lib/create-project-form-values'
import { getCreateProjectErrorMessage } from '../lib/get-create-project-error-message'
import {
  prependCreatedProjectToQueries,
  removeCreatedProjectFromQueries,
} from '../lib/prepend-created-project-to-queries-cache'
import { toProjectCreateRequest } from '../lib/to-project-create-request'

type CreateProjectMutationContext = {
  optimistic: Project
}

export interface UseCreateProjectOptions {
  magManager: string
  onCreated?: (project: Project) => void
}

export function useCreateProject({ magManager, onCreated }: UseCreateProjectOptions) {
  const queryClient = useQueryClient()
  const { halls, lofts } = useVenueCatalog()

  const mutation = useProjectsCreate<CreateProjectMutationContext>({
    mutation: {
      onMutate: async ({ data }) => {
        const hallId = data.hall_id
        const hall = halls.find((h) => h.id === hallId)
        const loftId = data.loft_id ?? null
        const loft = loftId != null ? lofts.find((l) => l.id === loftId) : undefined

        const optimistic = buildOptimisticProject({
          event_name: (data.title ?? data.event_name ?? '').trim(),
          event_type: data.event_type,
          event_type_label: getEventTypeLabelById(String(data.event_type)) ?? '',
          hall_id: hallId,
          hall_name: hall?.name ?? '',
          loft_id: loftId,
          loft_name: loft?.name ?? hall?.loft_name ?? '',
          event_date: data.event_date ?? toIsoLocalDay(new Date()),
          mag_manager: magManager,
        })
        prependCreatedProjectToQueries(queryClient, optimistic)
        return { optimistic }
      },
      onSuccess: (created, _variables, context) => {
        if (context?.optimistic) {
          removeCreatedProjectFromQueries(queryClient, context.optimistic)
        }
        prependCreatedProjectToQueries(queryClient, created)
        onCreated?.(created)
      },
      onError: (_error, _variables, context) => {
        if (context?.optimistic) {
          removeCreatedProjectFromQueries(queryClient, context.optimistic)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
      },
    },
  })

  const create = useCallback(
    (values: CreateProjectFormValues) => {
      mutation.mutate({ data: toProjectCreateRequest(values) })
    },
    [mutation],
  )

  const errorMessage = mutation.isError ? getCreateProjectErrorMessage(mutation.error) : null

  return {
    create,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
    reset: mutation.reset,
  }
}
