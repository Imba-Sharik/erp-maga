import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { projectToApiListRow, type ProjectDetail } from '@/entities/project'
import { patchProjectInMatchingCaches } from '@/shared/api'
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
 * Пока фронт-only: бэк-эндпоинта ещё нет, поэтому сеть не трогаем — обновляем кэш
 * оптимистично, чтобы новое название сразу было видно в карточке, списках и воронке.
 * Когда бэк будет готов — в `mutationFn` встаёт реальный PATCH, а потребители не меняются.
 * Бэк по контракту должен: выставить флаг «название редактировалось вручную» (Plum-sync
 * не перезапишет) и записать смену в «Лог действий» (кто, когда, было → стало).
 */
export function useEditProjectTitle({ onSuccess }: UseEditProjectTitleOptions = {}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ project, title }: EditProjectTitleInput) => {
      // TODO(ERP-231): подключить бэк, когда появится эндпоинт обновления названия, напр.:
      //   await projectsPartialUpdate(Number(project.id), { event_name: title })
      return { project, title }
    },
    onSuccess: ({ project, title }) => {
      const projectId = Number(project.id)
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
    onError: () => {
      toast.error('Не удалось обновить название')
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
