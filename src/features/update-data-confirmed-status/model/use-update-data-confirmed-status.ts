import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { notificationsListQueryKey } from '@/entities/notification'
import { getTransitionErrorMessage, invalidateProjectAfterTransition } from '@/shared/api'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { useProjectsTransitionsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsTransitionsCreate'
import { toast } from '@/shared/ui/toast'

export type DataConfirmedStatus = 'confirmed' | 'rejected'

interface UpdateDataConfirmedStatusArgs {
  projectId: string | number
  status: DataConfirmedStatus
}

/**
 * Установка статуса проверки данных руководителем на этапе `data_confirmed` (ERP-221).
 * Это отдельное действие над проектом (как статусы документов у бухгалтерии),
 * а не переход этапа: воронка не двигается, действие попадает в audit-лог.
 *
 * ИНТЕРИМ до выделенной ручки статуса на бэке (ERP-220):
 * - «Не приняты» — POST /transitions/ с `data_confirmed_status: rejected`. Бэк
 *   трактует это как no-op: ставит `data_rejected=true`, пишет лог и НЕ меняет этап.
 * - «Данные подтверждены» — без перехода на сервере зафиксировать нечем; статус
 *   остаётся локальным и уходит в transition-теле при «Следующий этап».
 * После ERP-220 обе ветки заменить на kubb-хук новой ручки из openapi.
 */
export function useUpdateDataConfirmedStatus() {
  const queryClient = useQueryClient()
  const mutation = useProjectsTransitionsCreate()

  const update = useCallback(
    ({ projectId, status }: UpdateDataConfirmedStatusArgs) => {
      if (status !== 'rejected') return
      const id = Number(projectId)
      mutation.mutate(
        { id, data: { to_stage: 'bonus_calculated', data_confirmed_status: 'rejected' } },
        {
          onSuccess: (detail) => {
            // Сервер — источник правды: свежий ProjectDetail несёт data_rejected и
            // data_confirmed_status для гидрации селекта после перезагрузки.
            queryClient.setQueryData(projectsRetrieveQueryKey(id), detail)
            invalidateProjectAfterTransition(queryClient, id)
            void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey() })
          },
          onError: (error) => {
            toast.error(getTransitionErrorMessage(error, 'Не удалось сохранить статус проверки'))
          },
        },
      )
    },
    [mutation, queryClient],
  )

  return useMemo(() => ({ update, isPending: mutation.isPending }), [update, mutation.isPending])
}
