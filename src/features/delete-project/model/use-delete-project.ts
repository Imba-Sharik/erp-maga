import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { Project } from '@/entities/project'
import { projectStageToApi, projectToApiListRow } from '@/entities/project'
import { useProjectsDestroy } from '@/shared/api/generated/hooks/projectsController/useProjectsDestroy'
import type { PaginatedProjectList } from '@/shared/api/generated/types/PaginatedProjectList'
import {
  removeProjectFromInfiniteCache,
  removeProjectFromMatchingCaches,
  restoreQueryCaches,
  snapshotTransitionCaches,
  type QueryCacheSnapshot,
} from '@/shared/api'
import { toast } from '@/shared/ui/toast'

import { getDeleteProjectErrorMessage } from '../lib/get-delete-project-error-message'

/** Admin-таблица «Все проекты» (`useProjectsTableQuery`) живёт на этом ключе. */
const PROJECTS_TABLE_QUERY_KEY = ['projects-table'] as const

interface UseDeleteProjectOptions {
  onSuccess?: () => void
}

/**
 * Soft-delete проекта (`DELETE /api/v1/projects/{id}/`, только admin). Оптимистично
 * убирает проект из кэшей списков; при ошибке (напр. 403) кэши откатываются.
 */
export function useDeleteProject({ onSuccess }: UseDeleteProjectOptions = {}) {
  const queryClient = useQueryClient()
  const mutation = useProjectsDestroy()

  const submit = useCallback(
    (project: Project) => {
      const projectId = Number(project.id)
      if (!Number.isFinite(projectId)) return

      const apiRow = projectToApiListRow(project)

      // Стандартные кэши списков + board-колонки канбана (kanban-проекты,
      // календарь). boardApiStage обязателен, иначе предикат пропустит колонки.
      const listSnapshot: QueryCacheSnapshot = snapshotTransitionCaches(queryClient, {
        projectsList: true,
      })
      removeProjectFromMatchingCaches(queryClient, apiRow, {
        boardApiStage: projectStageToApi(project.stage),
      })

      // Admin-таблица живёт на собственном ключе `['projects-table']` (infinite),
      // вне shared-хелперов — убираем отдельно, со своим снимком для отката.
      const tableSnapshot = queryClient.getQueriesData<InfiniteData<PaginatedProjectList>>({
        queryKey: PROJECTS_TABLE_QUERY_KEY,
      })
      queryClient.setQueriesData<InfiniteData<PaginatedProjectList>>(
        { queryKey: PROJECTS_TABLE_QUERY_KEY },
        (data) => (data ? removeProjectFromInfiniteCache(data, apiRow) : data),
      )

      mutation.mutate(
        { id: projectId },
        {
          onSuccess: () => {
            toast.success('Проект удалён')
            onSuccess?.()
          },
          onError: (error) => {
            restoreQueryCaches(queryClient, listSnapshot)
            restoreQueryCaches(queryClient, tableSnapshot)
            toast.error(getDeleteProjectErrorMessage(error))
          },
        },
      )
    },
    [mutation, onSuccess, queryClient],
  )

  return {
    submit,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error ? getDeleteProjectErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
