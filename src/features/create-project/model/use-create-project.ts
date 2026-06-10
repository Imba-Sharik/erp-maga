import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { plumCityLabelsByIds, useVenueCatalog } from '@/entities/venue'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { useProjectsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsCreate'
import type { Project } from '@/shared/api/generated/types/Project'
import type { ProjectCreateRequest } from '@/shared/api/generated/types/ProjectCreateRequest'
import type { ProjectHallItem } from '@/shared/api/generated/types/ProjectHallItem'
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
  magManagerId: number
  onCreated?: (project: Project) => void
}

function hallItemFromCatalog(hall: {
  id: number
  name: string
  loft: { id: number; name: string } | null
}): ProjectHallItem {
  return {
    hall_id: hall.id,
    hall_name: hall.name,
    loft_id: hall.loft?.id ?? null,
    loft_name: hall.loft?.name ?? '',
  }
}

function buildOptimisticFromRequest(
  data: ProjectCreateRequest,
  magManager: string,
  magManagerId: number,
  halls: ProjectHallItem[],
): Project {
  const event_date = data.event_date ?? toIsoLocalDay(new Date())
  const event_name = (data.title ?? data.event_name ?? '').trim()
  const event_type = data.event_type
  const city_ids = data.city_ids ?? []

  return buildOptimisticProject({
    event_name,
    event_type,
    event_type_label: getEventTypeLabelById(String(event_type)) ?? '',
    halls,
    event_date,
    mag_manager: magManager,
    mag_manager_id: magManagerId,
    city_ids,
    city_labels: plumCityLabelsByIds(city_ids),
  })
}

export function useCreateProject({ magManager, magManagerId, onCreated }: UseCreateProjectOptions) {
  const queryClient = useQueryClient()
  const { halls: venueHalls } = useVenueCatalog()

  const mutation = useProjectsCreate<CreateProjectMutationContext>({
    mutation: {
      onMutate: async ({ data }) => {
        const hallIds = data.hall_ids ?? (data.hall_id != null ? [data.hall_id] : [])
        const halls = hallIds
          .map((id) => venueHalls.find((h) => h.id === id))
          .filter((h): h is (typeof venueHalls)[number] => h != null)
          .map(hallItemFromCatalog)

        const optimistic = buildOptimisticFromRequest(data, magManager, magManagerId, halls)
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
      const halls = values.halls
        .map((id) => venueHalls.find((h) => h.id === Number(id)))
        .filter((h): h is (typeof venueHalls)[number] => h != null)
      if (halls.length === 0) return

      mutation.mutate({ data: toProjectCreateRequest(values, venueHalls) })
    },
    [mutation, venueHalls],
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
