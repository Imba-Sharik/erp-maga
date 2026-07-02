import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { getTransitionErrorMessage, invalidateProjectAfterTransition } from '@/shared/api'
import { useProjectsDataConfirmationPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsDataConfirmationPartialUpdate'
import { toast } from '@/shared/ui/toast'

export type DataConfirmedStatus = 'confirmed' | 'rejected'

interface UpdateDataConfirmedStatusArgs {
  projectId: string | number
  status: DataConfirmedStatus
}

/**
 * Статус проверки данных руководителем на этапе `data_confirmed` (ERP-220/221) —
 * PATCH /projects/{id}/data-confirmation/. Отдельное действие над проектом (как
 * статусы документов у бухгалтерии), а не переход этапа: воронка не двигается.
 *
 * `rejected` — системная пауза: бэк ставит `data_rejected`, снимает прежнее
 * подтверждение, шлёт ERP-уведомление менеджеру и пишет audit-лог; переход на
 * «Бонус рассчитан» отвечает 400, пока пауза не снята. `confirmed` — снимает паузу
 * и фиксирует подтверждение (кто/когда). Полная инвалидация проекта — чтобы
 * подсветка в списках/канбане и audit-лог обновились сразу.
 */
export function useUpdateDataConfirmedStatus() {
  const queryClient = useQueryClient()
  const mutation = useProjectsDataConfirmationPartialUpdate()

  const update = useCallback(
    ({ projectId, status }: UpdateDataConfirmedStatusArgs) => {
      const id = Number(projectId)
      mutation.mutate(
        { id, data: { status } },
        {
          onSuccess: () => {
            invalidateProjectAfterTransition(queryClient, id)
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
