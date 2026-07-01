import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { projectToApiListRow, type ProjectDetail } from '@/entities/project'
import {
  getTransitionErrorMessage,
  invalidateProjectAfterTransition,
  patchProjectInMatchingCaches,
} from '@/shared/api'
import { projectsNamePartialUpdate } from '@/shared/api/generated/clients/projectsController/projectsNamePartialUpdate'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import type { ProjectsRetrieveQueryResponse } from '@/shared/api/generated/types/projectsController/ProjectsRetrieve'
import { toast } from '@/shared/ui/toast'

interface EditProjectTitleInput {
  project: ProjectDetail
  title: string
}

interface UseEditProjectTitleOptions {
  onSuccess?: () => void
}

/**
 * Ручное редактирование названия проекта (ERP-231).
 *
 * `PATCH /projects/{id}/name/`: бэк проверяет права (403) и пустое значение (400),
 * выставляет `event_name_locked=true` (Plum-синхронизация больше не перезапишет название)
 * и пишет смену в «Лог действий». В ответе — авторитетное `event_name`.
 *
 * Detail-кэш и списки патчим оптимистично для мгновенного отклика в карточке/воронке;
 * `onSettled` инвалидирует проект (в т.ч. audit-log), чтобы «Лог действий» подтянул новую
 * запись, а название во всех вью сверилось с сервером.
 */
export function useEditProjectTitle({ onSuccess }: UseEditProjectTitleOptions = {}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ project, title }: EditProjectTitleInput) => {
      const data = await projectsNamePartialUpdate(Number(project.id), { event_name: title })
      return data
    },
    onSuccess: (data, { project }) => {
      const projectId = Number(project.id)
      // Бэк мог нормализовать значение — берём название из ответа.
      const title = data.event_name
      // Detail-кэш карточки: `title` маппится из `event_name` (см. mapBackendProjectDetail).
      queryClient.setQueryData<ProjectsRetrieveQueryResponse>(
        projectsRetrieveQueryKey(projectId),
        (prev) => (prev ? { ...prev, event_name: title } : prev),
      )
      // Списки, канбан, таблицы проектов.
      patchProjectInMatchingCaches(queryClient, projectToApiListRow({ ...project, title }))
      toast.success('Название обновлено')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(getTransitionErrorMessage(error, 'Не удалось обновить название'))
    },
    onSettled: (_data, _error, { project }) => {
      invalidateProjectAfterTransition(queryClient, Number(project.id))
    },
  })

  const submit = useCallback(
    ({ project, title }: EditProjectTitleInput) => {
      const trimmed = title.trim()
      if (!trimmed) return
      // Без изменений — просто закрываем редактор.
      if (trimmed === project.title) {
        onSuccess?.()
        return
      }
      mutation.mutate({ project, title: trimmed })
    },
    [mutation, onSuccess],
  )

  return useMemo(() => ({ submit, isPending: mutation.isPending }), [submit, mutation.isPending])
}
