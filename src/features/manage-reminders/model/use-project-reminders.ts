import { useCallback } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'

import {
  toReminderCreateRequest,
  toReminderUpdateRequest,
  type ReminderFormValues,
} from '@/entities/reminder'
import { useRemindersCreate } from '@/shared/api/generated/hooks/remindersController/useRemindersCreate'
import { useRemindersDestroy } from '@/shared/api/generated/hooks/remindersController/useRemindersDestroy'
import { useRemindersPartialUpdate } from '@/shared/api/generated/hooks/remindersController/useRemindersPartialUpdate'

import { getReminderErrorMessage } from '../lib/get-reminder-error-message'

/** Любой query напоминаний (список и календарь) — для инвалидации после мутаций. */
function isRemindersQuery(queryKey: QueryKey): boolean {
  const first = queryKey[0]
  return (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    typeof (first as { url: unknown }).url === 'string' &&
    (first as { url: string }).url.startsWith('/api/v1/reminders/')
  )
}

export interface UseProjectRemindersOptions {
  projectId: number
  onCreated?: () => void
  onUpdated?: () => void
  onDeleted?: () => void
}

/**
 * CRUD напоминаний, привязанных к проекту (`/reminders/` с `project_id`).
 * После мутаций инвалидируем все списки напоминаний (проектный список + календарь),
 * т.к. проектное напоминание видно и в календаре менеджера.
 */
export function useProjectReminders({
  projectId,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectRemindersOptions) {
  const queryClient = useQueryClient()
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ predicate: (q) => isRemindersQuery(q.queryKey) }),
    [queryClient],
  )

  const createM = useRemindersCreate({ mutation: { onSuccess: () => void invalidate() } })
  const updateM = useRemindersPartialUpdate({ mutation: { onSuccess: () => void invalidate() } })
  const deleteM = useRemindersDestroy({ mutation: { onSuccess: () => void invalidate() } })

  const create = useCallback(
    (values: ReminderFormValues) => {
      createM.mutate(
        { data: toReminderCreateRequest(values, projectId) },
        { onSuccess: () => onCreated?.() },
      )
    },
    [createM, projectId, onCreated],
  )

  const update = useCallback(
    (id: number, values: ReminderFormValues) => {
      updateM.mutate({ id, data: toReminderUpdateRequest(values) }, { onSuccess: () => onUpdated?.() })
    },
    [updateM, onUpdated],
  )

  const remove = useCallback(
    (id: number) => {
      deleteM.mutate({ id }, { onSuccess: () => onDeleted?.() })
    },
    [deleteM, onDeleted],
  )

  return {
    create,
    update,
    remove,
    isCreating: createM.isPending,
    isUpdating: updateM.isPending,
    isDeleting: deleteM.isPending,
    createError: createM.error ? getReminderErrorMessage(createM.error, 'Не удалось создать напоминание') : null,
    updateError: updateM.error ? getReminderErrorMessage(updateM.error, 'Не удалось изменить напоминание') : null,
    deleteError: deleteM.error ? getReminderErrorMessage(deleteM.error, 'Не удалось удалить напоминание') : null,
  }
}
