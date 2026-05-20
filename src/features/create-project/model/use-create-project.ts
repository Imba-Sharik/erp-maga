import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { useProjectsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsCreate'
import type { Project } from '@/shared/api/generated/types/Project'
import type { ProjectCreateRequest } from '@/shared/api/generated/types/ProjectCreateRequest'
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

function buildOptimisticFromRequest(data: ProjectCreateRequest, magManager: string): Project {
  const event_date = data.event_date ?? toIsoLocalDay(new Date())
  const event_name = (data.title ?? data.event_name ?? '').trim()
  const event_type = data.event_type

  return buildOptimisticProject({
    event_name,
    event_type,
    event_type_label: getEventTypeLabelById(String(event_type)) ?? '',
    loft: data.loft ?? data.venue ?? '',
    hall: data.hall ?? data.hall_loft ?? '',
    event_date,
    mag_manager: magManager,
  })
}

export function useCreateProject({ magManager, onCreated }: UseCreateProjectOptions) {
  const queryClient = useQueryClient()

  const mutation = useProjectsCreate<CreateProjectMutationContext>({
    mutation: {
      onMutate: async ({ data }) => {
        const optimistic = buildOptimisticFromRequest(data, magManager)
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
